import "server-only";

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit-log";

const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const TOTP_STEP_SECONDS = 30;

function encryptionKey() {
  // Keep existing installations compatible: deployments may use a dedicated
  // MFA key, while older installations safely fall back to AUTH_SECRET.
  const value = process.env.MFA_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("MFA_ENCRYPTION_KEY must be configured with at least 32 characters.");
  }
  return createHash("sha256").update(value).digest();
}

function base32Encode(value: Buffer) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let buffer = 0;
  let result = "";
  for (const byte of value) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      result += alphabet[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) result += alphabet[(buffer << (5 - bits)) & 31];
  return result;
}

function base32Decode(value: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let buffer = 0;
  const bytes: number[] = [];
  for (const character of value.replace(/=+$/, "").toUpperCase()) {
    const index = alphabet.indexOf(character);
    if (index < 0) throw new Error("Invalid MFA secret.");
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function encryptSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

function decryptSecret(value: string) {
  const [ivText, tagText, encryptedText] = value.split(".");
  if (!ivText || !tagText || !encryptedText) throw new Error("Invalid encrypted MFA secret.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivText, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function generateMfaSetup() {
  const secret = base32Encode(randomBytes(20));
  const issuer = encodeURIComponent("ShuachCloud Flashcards");
  return {
    secret,
    otpauthUri: `otpauth://totp/${issuer}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`,
    secretCiphertext: encryptSecret(secret),
  };
}

export function verifyTotpCode(
  secret: string,
  input: string,
  now = Date.now(),
  lastUsedStep?: number | null
) {
  const code = input.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return null;
  const currentStep = Math.floor(now / 1000 / TOTP_STEP_SECONDS);
  const secretBytes = base32Decode(secret);
  for (const offset of [-1, 0, 1]) {
    const step = currentStep + offset;
    if (lastUsedStep != null && step <= lastUsedStep) continue;
    const counter = Buffer.alloc(8);
    counter.writeBigInt64BE(BigInt(step));
    const digest = createHmac("sha1", secretBytes).update(counter).digest();
    const position = digest[digest.length - 1] & 15;
    const number =
      ((digest[position] & 127) << 24) |
      (digest[position + 1] << 16) |
      (digest[position + 2] << 8) |
      digest[position + 3];
    if (String(number % 1_000_000).padStart(6, "0") === code) return step;
  }
  return null;
}

export function createRecoveryCodes() {
  return Array.from({ length: 10 }, () => randomBytes(5).toString("hex").toUpperCase());
}

export async function issueMfaChallenge(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await prisma.mfaChallenge.deleteMany({ where: { userId } });
  await prisma.mfaChallenge.create({
    data: {
      tokenHash: createHash("sha256").update(token).digest("hex"),
      userId,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  });
  return token;
}

export async function verifyMfaChallenge(token: string, code: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const challenge = await prisma.mfaChallenge.findUnique({
    where: { tokenHash },
    include: { user: { include: { mfaDevice: true, mfaRecoveryCodes: true } } },
  });
  if (
    !challenge ||
    challenge.usedAt ||
    challenge.expiresAt <= new Date() ||
    challenge.attempts >= 5
  ) {
    return null;
  }

  const normalized = code.trim().toUpperCase();
  let acceptedStep: number | null = null;
  if (challenge.user.mfaDevice?.enabledAt) {
    acceptedStep = verifyTotpCode(
      decryptSecret(challenge.user.mfaDevice.secretCiphertext),
      normalized,
      Date.now(),
      challenge.user.mfaDevice.lastUsedStep
    );
  }

  const recoveryCode =
    acceptedStep == null
      ? challenge.user.mfaRecoveryCodes.find(
          (entry) => !entry.usedAt && bcrypt.compareSync(normalized, entry.codeHash)
        )
      : null;
  if (acceptedStep == null && !recoveryCode) {
    await prisma.mfaChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    await writeAuditLog(
      { id: challenge.user.id, email: challenge.user.email },
      { action: "MFA_LOGIN_FAILED", targetType: "USER", targetId: challenge.user.id }
    ).catch(() => undefined);
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.mfaChallenge.update({ where: { id: challenge.id }, data: { usedAt: new Date() } });
    if (acceptedStep != null && challenge.user.mfaDevice) {
      await tx.mfaDevice.update({
        where: { id: challenge.user.mfaDevice.id },
        data: { lastUsedStep: acceptedStep },
      });
    }
    if (recoveryCode) {
      await tx.mfaRecoveryCode.update({
        where: { id: recoveryCode.id },
        data: { usedAt: new Date() },
      });
    }
  });
  await writeAuditLog(
    { id: challenge.user.id, email: challenge.user.email },
    {
      action: recoveryCode ? "MFA_RECOVERY_LOGIN" : "MFA_LOGIN_SUCCESS",
      targetType: "USER",
      targetId: challenge.user.id,
    }
  ).catch(() => undefined);
  return challenge.user;
}

export { decryptSecret, encryptSecret };
