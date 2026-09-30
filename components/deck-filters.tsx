import Link from "next/link";
import { LANGUAGE_VALUES } from "@/lib/categories";
import { t, type Locale } from "@/lib/i18n";
import { DECK_DIFFICULTIES } from "@/lib/difficulty";
import type { DifficultyOrder } from "@/lib/deck-filters";

export function DeckFilters({
  action,
  categories,
  tracks,
  language,
  category,
  track,
  difficulty,
  difficultyOrder,
  locale,
}: {
  action: string;
  categories: { id: string; name: string }[];
  tracks: { id: string; name: string }[];
  language?: string;
  category?: string;
  track?: string;
  difficulty?: string;
  difficultyOrder?: DifficultyOrder;
  locale: Locale;
}) {
  const hasFilters = Boolean(language || category || track || difficulty || difficultyOrder);

  return (
    <details open={hasFilters} className="group mb-6">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-2xl border border-brand-accent bg-surface-accent px-4 py-3 font-bold text-brand-primary shadow-[0_2px_8px_rgba(8,125,226,0.12)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent [&::-webkit-details-marker]:hidden">
        <span>{t(locale, "deckFilters.toggle")}</span>
        <span
          className="text-2xl font-black leading-none transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          ⌄
        </span>
      </summary>
      <form
        method="get"
        action={action}
        className="mt-3 flex flex-col items-stretch gap-3 rounded-2xl border border-brand-accent/40 bg-white p-4 shadow-[0_2px_8px_rgba(8,125,226,0.08)] sm:flex-row sm:flex-wrap sm:items-end"
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
          {t(locale, "deckFilters.track")}
          <select
            name="track"
            defaultValue={track ?? ""}
            className="rounded-xl border border-neutral-muted bg-white px-3 py-2 font-normal text-text-muted"
          >
            <option value="">{t(locale, "deckFilters.allTracks")}</option>
            {tracks.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
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
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm font-semibold text-brand-primary">
          {t(locale, "deckFilters.difficulty")}
          <select
            name="difficulty"
            defaultValue={difficulty ?? ""}
            className="rounded-xl border border-neutral-muted bg-white px-3 py-2 font-normal text-text-muted"
          >
            <option value="">{t(locale, "deckFilters.allDifficulties")}</option>
            {DECK_DIFFICULTIES.map((value) => (
              <option key={value} value={value}>
                {t(locale, `deck.difficulty.${value}` as "deck.difficulty.EASY" | "deck.difficulty.INTERMEDIATE" | "deck.difficulty.HARD")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-44 flex-1 flex-col gap-1 text-sm font-semibold text-brand-primary">
          {t(locale, "deckFilters.difficultyOrder")}
          <select
            name="difficultyOrder"
            defaultValue={difficultyOrder ?? ""}
            className="rounded-xl border border-neutral-muted bg-white px-3 py-2 font-normal text-text-muted"
          >
            <option value="">{t(locale, "deckFilters.defaultOrder")}</option>
            <option value="asc">{t(locale, "deckFilters.easyToHard")}</option>
            <option value="desc">{t(locale, "deckFilters.hardToEasy")}</option>
          </select>
        </label>
        <button
          type="submit"
          className="min-h-11 w-full rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110 sm:w-auto sm:min-h-0"
        >
          {t(locale, "deckFilters.apply")}
        </button>
        {hasFilters && (
          <Link
            href={action}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-brand-primary/20 px-5 py-2.5 font-semibold text-brand-primary transition hover:bg-brand-primary/5 sm:w-auto sm:min-h-0"
          >
            {t(locale, "deckFilters.clear")}
          </Link>
        )}
      </form>
    </details>
  );
}
