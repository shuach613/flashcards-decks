"use client";

import { useTransition } from "react";
import { setLocale } from "@/lib/i18n-actions";
import type { Locale } from "@/lib/i18n";

export function LanguageToggle({ current }: { current: Locale }) {
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === current || isPending) return;
    startTransition(async () => {
      await setLocale(locale);
    });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-evergreen/20 p-0.5 text-xs font-semibold">
      {(["en", "de"] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          disabled={isPending}
          className={`rounded-full px-2.5 py-1 uppercase transition ${
            current === locale
              ? "bg-evergreen text-white"
              : "text-evergreen hover:bg-evergreen/5"
          }`}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
