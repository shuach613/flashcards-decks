export const DECK_DIFFICULTIES = ["EASY", "INTERMEDIATE", "HARD"] as const;

export type DeckDifficulty = (typeof DECK_DIFFICULTIES)[number];

export function isDeckDifficulty(value: unknown): value is DeckDifficulty {
  return (
    typeof value === "string" &&
    (DECK_DIFFICULTIES as readonly string[]).includes(value)
  );
}
