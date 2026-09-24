import "server-only";
import { createHash, randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { t, type Locale } from "@/lib/i18n";
import { VERIFICATION_TOKEN_TTL_MS } from "@/lib/email-verification-policy";

const appUrl = () =>
  (process.env.APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "").replace(
    /\/$/,
    ""
  );

export async function issueVerificationToken(userId: string, attempt: number) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { userId } }),
    prisma.verificationToken.create({
      data: { tokenHash, userId, attempt, expiresAt },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { verificationAttempts: attempt },
    }),
  ]);

  return { token, tokenHash };
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  locale: Locale
) {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  const baseUrl = appUrl();

  if (!host || !Number.isFinite(port) || !user || !password || !from || !baseUrl) {
    throw new Error(
      "Verification email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, and APP_URL."
    );
  }

  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: t(locale, "auth.verificationEmailSubject"),
    text: [
      t(locale, "auth.verificationEmailIntro"),
      "",
      `${t(locale, "auth.verificationEmailLinkLabel")}: ${verificationUrl}`,
      "",
      t(locale, "auth.verificationEmailExpiry"),
      t(locale, "auth.verificationEmailResend"),
    ].join("\n"),
    html: `<p>${t(locale, "auth.verificationEmailIntro")}</p><p><a href="${verificationUrl}">${t(locale, "auth.verificationEmailLinkLabel")}</a></p><p>${t(locale, "auth.verificationEmailExpiry")}</p><p>${t(locale, "auth.verificationEmailResend")}</p>`,
  });
}
