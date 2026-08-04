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

export type DeckStudyState = "not-started" | "in-progress" | "complete";
export type CardStudyStatus = "good" | "needs-study" | "not-reviewed";

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

export function getDeckStudyState(
  progress: ProgressSummary,
  hasStudyRecord: boolean
): DeckStudyState {
  if (progress.isComplete) return "complete";
  if (hasStudyRecord || progress.goodCount > 0) return "in-progress";
  return "not-started";
}

export function getCardStudyStatus(
  progress?: { isGood: boolean } | null
): CardStudyStatus {
  if (!progress) return "not-reviewed";
  return progress.isGood ? "good" : "needs-study";
}
