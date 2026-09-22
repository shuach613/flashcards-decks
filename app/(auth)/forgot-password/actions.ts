"use server";

import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";
import { rateLimit } from "@/lib/rate-limit";

export type FormState = { message?: string; error?: string } | undefined;

const genericMessage =
  "If an account exists for that email, we have sent a password reset link.";

export async function requestPasswordReset(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();

  if (!email) return { error: "Enter your email address." };

  if (!rateLimit(`password-reset:${email}`, 3, 15 * 60 * 1000).allowed) {
    return { message: genericMessage };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (error) {
      await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      console.error("Password reset email could not be sent.", error);
    }
  }

  return { message: genericMessage };
}
