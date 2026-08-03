import "server-only";

type Certificate = { id: string; name: string; order: number };

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
  createdAt: Date;
  certificate: Certificate | null;
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
    certificate: deck.certificate
      ? { id: deck.certificate.id, name: deck.certificate.name }
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

export function serializeCertificate(
  certificate: Certificate & { _count?: { decks: number } }
) {
  return {
    id: certificate.id,
    name: certificate.name,
    order: certificate.order,
    deckCount: certificate._count?.decks,
  };
}
