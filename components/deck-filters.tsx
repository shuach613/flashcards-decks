import Link from "next/link";
import { LANGUAGE_VALUES } from "@/lib/categories";
import { t, type Locale } from "@/lib/i18n";

export function DeckFilters({
  action,
  categories,
  language,
  category,
  locale,
}: {
  action: string;
  categories: { id: string; name: string }[];
  language?: string;
  category?: string;
  locale: Locale;
}) {
  const hasFilters = Boolean(language || category);

  return (
    <form
      method="get"
      action={action}
      className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-muted bg-white p-4 shadow-[0_2px_8px_rgba(25,51,37,0.06)]"
    >
      <label className="flex min-w-36 flex-1 flex-col gap-1 text-sm font-semibold text-brand-primary">
        {t(locale, "deckFilters.language")}
        <select
          name="language"
          defaultValue={language ?? ""}
          className="rounded-xl border border-neutral-muted bg-white px-3 py-2 font-normal text-text-muted"
        >
          <option value="">{t(locale, "deckFilters.allLanguages")}</option>
          {LANGUAGE_VALUES.map((value) => (
            <option key={value} value={value}>
              {value === "DE" ? "🇩🇪" : "🇬🇧"} {t(locale, `language.${value}` as "language.EN" | "language.DE")}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-44 flex-1 flex-col gap-1 text-sm font-semibold text-brand-primary">
        {t(locale, "deckFilters.category")}
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-xl border border-neutral-muted bg-white px-3 py-2 font-normal text-text-muted"
        >
          <option value="">{t(locale, "deckFilters.allCategories")}</option>
          {categories.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
      >
        {t(locale, "deckFilters.apply")}
      </button>
      {hasFilters && (
        <Link
          href={action}
          className="rounded-full border border-brand-primary/20 px-5 py-2.5 font-semibold text-brand-primary transition hover:bg-brand-primary/5"
        >
          {t(locale, "deckFilters.clear")}
        </Link>
      )}
    </form>
  );
}
