"use client";

import Link from "next/link";
import { dismissMfaPrompt } from "@/app/settings/actions";
import { t, type Locale } from "@/lib/i18n";

export function MfaPrompt({ locale }: { locale: Locale }) {
  return (
    <div className="border-b border-brand-primary/10 bg-brand-primary/5">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-brand-primary">{t(locale, "settings.mfaPrompt")}</p>
        <div className="flex items-center gap-3">
          <Link href="/settings?tab=account#mfa" className="rounded-full bg-brand-primary px-3 py-1.5 font-semibold text-white">
            {t(locale, "settings.mfaSetUpNow")}
          </Link>
          <form action={dismissMfaPrompt}>
            <button type="submit" className="font-medium text-brand-primary underline underline-offset-4">
              {t(locale, "settings.mfaSkip")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
