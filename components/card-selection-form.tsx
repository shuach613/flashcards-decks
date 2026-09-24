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
    <details className="mt-4 rounded-2xl border border-sand bg-white p-5">
      <summary className="cursor-pointer font-semibold text-evergreen">
        {t(locale, "study.chooseCards")}
      </summary>
      <p className="mt-2 text-sm text-dark-gray">
        {t(locale, "study.chooseCardsHint")}
      </p>
      <form action={`/decks/${deckSlug}/study`} method="get" className="mt-4">
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {cards.map((card, index) => (
            <label
              key={card.id}
              className="flex cursor-pointer gap-3 rounded-xl border border-sand px-3 py-2 text-sm hover:bg-sand/30"
            >
              <input
                type="checkbox"
                name="cardIds"
                value={card.id}
                className="mt-1 size-4 accent-evergreen"
              />
              <span className="min-w-0">
                <span className="block font-semibold text-evergreen">
                  {index + 1}. {card.front}
                </span>
                <span className="block truncate text-dark-gray">{card.back}</span>
              </span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="mt-4 rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
        >
          {t(locale, "study.studySelected")}
        </button>
      </form>
    </details>
  );
}
