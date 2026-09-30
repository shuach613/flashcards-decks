"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MAX_PASSWORD_LENGTH } from "@/lib/input-limits";

export type FormState = { error?: string } | undefined;

export async function resetPassword(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!token) return { error: "This reset link is invalid or has expired." };
  if (password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
    return { error: "Your password must be at least 8 characters long." };
  }
  if (password !== confirmation) {
    return { error: "The passwords do not match." };
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.expiresAt <= new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  redirect("/login?reset=success");
}
