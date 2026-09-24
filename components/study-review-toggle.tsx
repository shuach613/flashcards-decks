"use client";

import { t, type Locale } from "@/lib/i18n";

export function StudyReviewToggle({
  checked,
  disabled,
  locale,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  locale: Locale;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-xl border border-sand bg-white px-4 py-3 text-sm text-dark-gray">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 accent-evergreen"
      />
      <span>
        <span className="block font-semibold text-evergreen">
          {t(locale, "study.includeGoodCards")}
        </span>
        <span className="block text-xs text-dark-gray">
          {t(locale, "study.includeGoodCardsHint")}
        </span>
      </span>
    </label>
  );
}
