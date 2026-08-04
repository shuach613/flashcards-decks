export type CardWithProgress = {
  id: string;
  isGood: boolean;
};

export type ProgressSummary = {
  totalCount: number;
  goodCount: number;
  pendingCount: number;
  isComplete: boolean;
};

export function summarizeProgress(cards: CardWithProgress[]): ProgressSummary {
  const totalCount = cards.length;
  const goodCount = cards.filter((card) => card.isGood).length;

  return {
    totalCount,
    goodCount,
    pendingCount: totalCount - goodCount,
    isComplete: totalCount > 0 && goodCount === totalCount,
  };
}
