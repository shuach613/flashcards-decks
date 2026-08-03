"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";

export type FormState = { error?: string } | undefined;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function signup(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const locale = await getLocale();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  if (!email || !password) {
    return { error: t(locale, "auth.emailPasswordRequired") };
  }
  if (password.length < 8) {
    return { error: t(locale, "auth.passwordTooShort") };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: t(locale, "auth.emailExists") };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role = adminEmails().includes(email) ? "ADMIN" : "USER";

  await prisma.user.create({ data: { email, passwordHash, role } });

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: t(locale, "auth.accountCreatedPleaseLogin") };
    }
    throw error;
  }
}
