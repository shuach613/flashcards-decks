"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export type FormState = { error?: string } | undefined;

export async function login(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    await signIn("credentials", {
      email: formData.get("email"),
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
