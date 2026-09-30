"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { rateLimit } from "@/lib/rate-limit";
import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/input-limits";

export type FormState = { error?: string } | undefined;

export async function login(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (email.length > MAX_EMAIL_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return { error: "Invalid email or password." };
  }
  if (!rateLimit(`login:${email}`, 10, 15 * 60 * 1000).allowed) {
    return { error: "Too many login attempts. Please try again later." };
  }

  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const locale = await getLocale();
      return { error: t(locale, "auth.invalidCredentials") };
    }
    throw error;
  }
}
