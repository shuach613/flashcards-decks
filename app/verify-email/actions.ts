"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function confirmEmailVerification(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const tokenHash = token ? createHash("sha256").update(token).digest("hex") : "";
  const verificationToken = tokenHash
    ? await prisma.verificationToken.findUnique({ where: { tokenHash } })
    : null;

  if (!verificationToken) redirect("/verify-email?status=invalid");

  if (verificationToken.expiresAt <= new Date()) {
    if (verificationToken.attempt >= 2) {
      await prisma.user.deleteMany({
        where: { id: verificationToken.userId, emailVerifiedAt: null },
      });
      redirect("/verify-email?status=deleted");
    }
    await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
    redirect("/verify-email?status=expired");
  }

  await prisma.$transaction([
    prisma.user.updateMany({
      where: { id: verificationToken.userId, emailVerifiedAt: null },
      data: { emailVerifiedAt: new Date(), sessionVersion: { increment: 1 } },
    }),
    prisma.verificationToken.deleteMany({ where: { userId: verificationToken.userId } }),
  ]);
  redirect("/verify-email?status=success");
}
