import { t, type Locale } from "@/lib/i18n";

export function CardSelectionForm({
  deckSlug,
  cards,
  locale,
}: {
  deckSlug: string;
  cards: { id: string; front: string; back: string }[];
  locale: Locale;
}) {
  return (
    <details className="mt-4 rounded-2xl border border-neutral-muted bg-white p-5">
      <summary className="cursor-pointer font-semibold text-brand-primary">
        {t(locale, "study.chooseCards")}
      </summary>
      <p className="mt-2 text-sm text-text-muted">
        {t(locale, "study.chooseCardsHint")}
      </p>
      <form action={`/decks/${deckSlug}/study`} method="get" className="mt-4">
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {cards.map((card, index) => (
            <label
              key={card.id}
              className="flex cursor-pointer gap-3 rounded-xl border border-neutral-muted px-3 py-2 text-sm hover:bg-surface-muted/30"
            >
              <input
                type="checkbox"
                name="cardIds"
                value={card.id}
                className="mt-1 size-4 accent-brand-primary"
              />
              <span className="min-w-0">
                <span className="block font-semibold text-brand-primary">
                  {index + 1}. {card.front}
                </span>
                <span className="block truncate text-text-muted">{card.back}</span>
              </span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="mt-4 rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
        >
          {t(locale, "study.studySelected")}
        </button>
      </form>
    </details>
  );
}
