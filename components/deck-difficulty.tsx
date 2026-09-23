import { t, type Locale } from "@/lib/i18n";
import { isDeckDifficulty, type DeckDifficulty } from "@/lib/difficulty";

const difficultyLevel: Record<DeckDifficulty, number> = {
  EASY: 1,
  INTERMEDIATE: 2,
  HARD: 3,
};

const activeBarClass: Record<DeckDifficulty, string> = {
  EASY: "bg-grass-green",
  INTERMEDIATE: "bg-yellow-400",
  HARD: "bg-red-600",
};

export function DeckDifficultyIndicator({
  difficulty: rawDifficulty,
  locale,
}: {
  difficulty: string;
  locale: Locale;
}) {
  const difficulty: DeckDifficulty = isDeckDifficulty(rawDifficulty)
    ? rawDifficulty
    : "INTERMEDIATE";
  const level = difficultyLevel[difficulty];
  const label = t(locale, `deck.difficulty.${difficulty}` as const);

  return (
    <span
      className="inline-flex items-end gap-0.5"
      role="img"
      aria-label={label}
      title={label}
    >
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          aria-hidden="true"
          className={`w-1.5 rounded-sm ${
            bar <= level ? activeBarClass[difficulty] : "bg-soft-gray"
          } ${bar === 1 ? "h-1.5" : bar === 2 ? "h-2.5" : "h-3.5"}`}
        />
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}
