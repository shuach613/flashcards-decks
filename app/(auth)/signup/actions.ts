"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { ensureDefaultTracks } from "@/lib/tracks-server";
import { rateLimit } from "@/lib/rate-limit";

export type FormState = { error?: string } | undefined;

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
  const trackId = String(formData.get("trackId") ?? "");

  if (!rateLimit(`signup:${email}`, 5, 15 * 60 * 1000).allowed) {
    return { error: "Too many signup attempts. Please try again later." };
  }

  if (!email || !password) {
    return { error: t(locale, "auth.emailPasswordRequired") };
  }
  if (password.length < 8) {
    return { error: t(locale, "auth.passwordTooShort") };
  }
  if (!trackId) {
    return { error: t(locale, "auth.trackRequired") };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: t(locale, "auth.emailExists") };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await ensureDefaultTracks();
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    select: { id: true },
  });
  if (!track) return { error: t(locale, "auth.trackRequired") };

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      tracks: { create: { trackId: track.id } },
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: t(locale, "auth.accountCreatedPleaseLogin") };
    }
    throw error;
  }
}
