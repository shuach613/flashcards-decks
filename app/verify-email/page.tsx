import Link from "next/link";
import { prisma } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { createHash } from "node:crypto";
import { confirmEmailVerification } from "./actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>;
}) {
  const locale = await getLocale();
  const { token: rawToken, status } = await searchParams;
  const token = String(rawToken ?? "");
  const tokenHash = token ? createHash("sha256").update(token).digest("hex") : "";
  const verificationToken = tokenHash
    ? await prisma.verificationToken.findUnique({ where: { tokenHash } })
    : null;

  const message = status === "success"
    ? t(locale, "settings.verificationSuccess")
    : status === "expired"
      ? t(locale, "settings.verificationExpired")
      : status === "deleted"
        ? t(locale, "settings.verificationDeleted")
        : status === "invalid"
          ? t(locale, "settings.verificationInvalid")
          : verificationToken
            ? t(locale, "settings.verificationConfirmBody")
            : t(locale, "settings.verificationInvalid");

  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <div className="rounded-2xl border border-neutral-muted bg-white p-8 text-center shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-primary">
          {t(locale, "settings.activationRequired")}
        </h1>
        <p className="mt-4 text-sm text-text-muted">{message}</p>
        {verificationToken && !status && (
          <form action={confirmEmailVerification} className="mt-6">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-white"
            >
              {t(locale, "settings.confirmVerification")}
            </button>
          </form>
        )}
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-brand-primary underline underline-offset-4"
        >
          {t(locale, "nav.logIn")}
        </Link>
      </div>
    </div>
  );
}
