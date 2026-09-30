"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { deckAccessWhere } from "@/lib/tracks-server";
import { isValidEmail, normalizeEmail } from "@/lib/settings";
import { issueVerificationToken, sendVerificationEmail } from "@/lib/email-verification";
import { writeAuditLog } from "@/lib/audit-log";
import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/input-limits";

export type SettingsState = { error?: string; message?: string } | undefined;

export async function changeEmail(
  _previousState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const sessionUser = await requireUser();
  const locale = await getLocale();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!email || email.length > MAX_EMAIL_LENGTH) return { error: t(locale, "settings.emailInvalid") };
  if (!isValidEmail(email)) return { error: t(locale, "settings.emailInvalid") };
  if (!password || password.length > MAX_PASSWORD_LENGTH) return { error: t(locale, "settings.passwordRequired") };

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect("/login");
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return { error: t(locale, "settings.passwordIncorrect") };
  }
  if (email === user.email) return { error: t(locale, "settings.emailSame") };

  const previousVerification = user.emailVerifiedAt;
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        emailVerifiedAt: null,
        verificationAttempts: 0,
        sessionVersion: { increment: 1 },
      },
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { error: t(locale, "settings.emailExists") };
    }
    console.error("Email address could not be updated.", error);
    return { error: t(locale, "settings.updateFailed") };
  }

  const { token, tokenHash } = await issueVerificationToken(user.id, 1);
  try {
    await sendVerificationEmail(email, token, locale);
  } catch (error) {
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { tokenHash } }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          emailVerifiedAt: previousVerification,
          verificationAttempts: user.verificationAttempts,
          sessionVersion: { increment: 1 },
        },
      }),
    ]);
    console.error("Verification email for changed address could not be sent.", error);
    return { error: t(locale, "auth.verificationEmailFailed") };
  }

  try {
    await writeAuditLog(sessionUser, {
      action: "EMAIL_CHANGED",
      targetType: "USER",
      targetId: user.id,
      metadata: { newEmail: email, verificationRequired: true },
    });
  } catch (error) {
    console.error("Could not write email-change audit log.", error);
  }

  await signOut({ redirectTo: "/login?emailChanged=1" });
}

export async function resetDeckProgress(deckId: string, formData: FormData) {
  const sessionUser = await requireUser();
  const confirmed = String(formData.get("confirmed") ?? "") === "yes";
  if (!confirmed) return;

  const databaseUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, role: true },
  });
  if (!databaseUser) redirect("/login");

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, ...deckAccessWhere(databaseUser) },
    select: { id: true },
  });
  if (!deck) return;

  await prisma.$transaction([
    prisma.cardProgress.updateMany({
      where: { userId: databaseUser.id, card: { deckId: deck.id } },
      data: { isGood: false },
    }),
    prisma.studyProgress.upsert({
      where: { userId_deckId: { userId: databaseUser.id, deckId: deck.id } },
      create: { userId: databaseUser.id, deckId: deck.id },
      update: { lastStudiedAt: new Date() },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/decks");
  revalidatePath("/settings");
}

export async function deleteAccount(formData: FormData) {
  const sessionUser = await requireUser();
  const confirmed = String(formData.get("confirmed") ?? "") === "yes";
  const password = String(formData.get("password") ?? "");
  if (!confirmed || !password) return;

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return;

  try {
    await writeAuditLog(sessionUser, {
      action: "ACCOUNT_DELETED",
      targetType: "USER",
      targetId: user.id,
      metadata: { email: user.email },
    });
  } catch (error) {
    console.error("Could not write account-deletion audit log.", error);
  }

  await prisma.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: "/login?accountDeleted=1" });
}
