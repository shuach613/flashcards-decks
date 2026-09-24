"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { issueVerificationToken, sendVerificationEmail } from "@/lib/email-verification";
import {
  isExpiredVerificationAttempt,
  nextVerificationAttempt,
} from "@/lib/email-verification-policy";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { rateLimit } from "@/lib/rate-limit";

export type VerificationState = { error?: string; message?: string } | undefined;

export async function requestVerificationEmail(
  _previousState: VerificationState,
  _formData: FormData
): Promise<VerificationState> {
  void _previousState;
  void _formData;
  const sessionUser = await requireUser();
  const locale = await getLocale();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect("/login");
  if (user.emailVerifiedAt || (user.role === "ADMIN" && user.isPrimaryAdmin)) {
    return { message: t(locale, "settings.verificationAlreadyActive") };
  }

  const currentToken = await prisma.verificationToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (
    user.verificationAttempts >= 2 &&
    (!currentToken || isExpiredVerificationAttempt(2, currentToken.expiresAt))
  ) {
    await prisma.user.delete({ where: { id: user.id } });
    redirect("/login?verificationExpired=1");
  }
  if (user.verificationAttempts >= 2) {
    return { error: t(locale, "settings.verificationFinalAttempt") };
  }
  if (!rateLimit(`verification:${user.id}`, 2, 15 * 60 * 1000).allowed) {
    return { error: t(locale, "settings.verificationRateLimited") };
  }

  const nextAttempt = nextVerificationAttempt(user.verificationAttempts);
  if (!nextAttempt) return { error: t(locale, "settings.verificationFinalAttempt") };
  const { token, tokenHash } = await issueVerificationToken(user.id, nextAttempt);
  try {
    await sendVerificationEmail(user.email, token, locale);
  } catch (error) {
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { tokenHash } }),
      prisma.user.update({
        where: { id: user.id },
        data: { verificationAttempts: user.verificationAttempts },
      }),
    ]);
    console.error("Verification email could not be sent.", error);
    return { error: t(locale, "auth.verificationEmailFailed") };
  }

  return { message: t(locale, "settings.verificationSent") };
}
