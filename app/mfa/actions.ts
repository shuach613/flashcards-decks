"use server";

import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { signIn } from "@/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { rateLimit } from "@/lib/rate-limit";

export type MfaLoginState = { error?: string } | undefined;

export async function verifyMfaLogin(
  _previousState: MfaLoginState,
  formData: FormData
): Promise<MfaLoginState> {
  const locale = await getLocale();
  const code = String(formData.get("code") ?? "").trim();
  const cookieStore = await cookies();
  const challenge = cookieStore.get("mfa-challenge")?.value;
  const email = cookieStore.get("mfa-email")?.value;
  const callbackUrl = cookieStore.get("mfa-callback")?.value ?? "/";
  if (!challenge || !email || !rateLimit(`mfa:${email}`, 8, 10 * 60 * 1000).allowed) {
    return { error: t(locale, "auth.mfaTooManyAttempts") };
  }
  try {
    await signIn("credentials", {
      email,
      mfaChallenge: challenge,
      mfaCode: code,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: t(locale, "auth.mfaInvalid") };
    throw error;
  }
}
