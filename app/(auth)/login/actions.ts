"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { rateLimit } from "@/lib/rate-limit";

export type FormState = { error?: string } | undefined;

export async function login(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!rateLimit(`login:${email}`, 10, 15 * 60 * 1000).allowed) {
    return { error: "Too many login attempts. Please try again later." };
  }

  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
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
