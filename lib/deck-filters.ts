import { isDeckDifficulty, type DeckDifficulty } from "./difficulty.ts";

export type DifficultyOrder = "asc" | "desc";

const difficultyRank: Record<DeckDifficulty, number> = {
  EASY: 1,
  INTERMEDIATE: 2,
  HARD: 3,
};

export function parseDifficulty(value: string | undefined): DeckDifficulty | undefined {
  return value && isDeckDifficulty(value) ? value : undefined;
}

export function parseDifficultyOrder(value: string | undefined): DifficultyOrder | undefined {
  return value === "asc" || value === "desc" ? value : undefined;
}

export function matchesDifficulty(
  difficulty: string,
  selected: DeckDifficulty | undefined,
) {
  return !selected || difficulty === selected;
}

export function compareDifficulty(
  left: string,
  right: string,
  order: DifficultyOrder,
) {
  const leftRank = difficultyRank[isDeckDifficulty(left) ? left : "INTERMEDIATE"];
  const rightRank = difficultyRank[isDeckDifficulty(right) ? right : "INTERMEDIATE"];
  return order === "asc" ? leftRank - rightRank : rightRank - leftRank;
}
