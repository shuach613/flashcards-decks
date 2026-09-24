export type StudyQueueCard = {
  isGood: boolean;
};

export function selectStudyCards<T extends { id: string }>(
  cards: T[],
  selectedIds?: Iterable<string>
): T[] {
  if (!selectedIds) return cards;
  const allowedIds = new Set(selectedIds);
  return cards.filter((card) => allowedIds.has(card.id));
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

/**
 * Build a session queue without changing the completion rule stored by the server.
 * Good cards are optional review material and are sampled at roughly one per
 * three pending cards, so they never count as newly completed work.
 */
export function buildStudyQueue<T extends StudyQueueCard>(
  cards: T[],
  includeGood: boolean
): T[] {
  const pendingCards = shuffle(cards.filter((card) => !card.isGood));
  if (!includeGood) return pendingCards;

  const goodCards = shuffle(cards.filter((card) => card.isGood));
  if (pendingCards.length === 0) return goodCards;

  const reviewCount = Math.min(
    goodCards.length,
    Math.max(1, Math.ceil(pendingCards.length / 3))
  );

  return shuffle([...pendingCards, ...goodCards.slice(0, reviewCount)]);
}
