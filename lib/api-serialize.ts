import "server-only";

type Category = { id: string; name: string; order: number };

type Card = {
  id: string;
  front: string;
  back: string;
  order: number;
};

type Deck = {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  createdAt: Date;
  category: Category | null;
  cards?: Card[];
  _count?: { cards: number };
};

export function serializeDeck(deck: Deck, origin: string) {
  return {
    id: deck.id,
    slug: deck.slug,
    title: deck.title,
    description: deck.description,
    language: deck.language,
    difficulty: deck.difficulty,
    category: deck.category
      ? { id: deck.category.id, name: deck.category.name }
      : null,
    cardCount: deck._count?.cards ?? deck.cards?.length,
    cards: deck.cards?.map(serializeCard),
    shareUrl: `${origin}/decks/${deck.slug}`,
    createdAt: deck.createdAt,
  };
}

export function serializeCard(card: Card) {
  return {
    id: card.id,
    front: card.front,
    back: card.back,
    order: card.order,
  };
}

export function serializeCategory(
  category: Category & { _count?: { decks: number } }
) {
  return {
    id: category.id,
    name: category.name,
    order: category.order,
    deckCount: category._count?.decks,
  };
}
