"use server";

import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { findUserWithValidPassword } from "@/lib/auth-credentials";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { rateLimit } from "@/lib/rate-limit";
import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/input-limits";
import { issueMfaChallenge } from "@/lib/mfa";

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

  const user = await findUserWithValidPassword(email, password);
  if (user?.mfaDevice?.enabledAt) {
    if (!user.emailVerifiedAt && !(user.role === "ADMIN" && user.isPrimaryAdmin)) {
      return { error: t(await getLocale(), "auth.invalidCredentials") };
    }
    const challenge = await issueMfaChallenge(user.id);
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    };
    cookieStore.set("mfa-challenge", challenge, cookieOptions);
    cookieStore.set("mfa-email", user.email, cookieOptions);
    cookieStore.set("mfa-callback", callbackUrl, cookieOptions);
    redirect("/mfa");
  }

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
