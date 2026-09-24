import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { StudySession } from "./study-session";
import { requireTrackedUser } from "@/lib/authz";
import { deckAccessWhere } from "@/lib/tracks-server";
import { selectStudyCards } from "@/lib/study-queue";

export default async function StudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ cardIds?: string | string[] }>;
}) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : undefined;
  const selectedIds = query?.cardIds
    ? new Set(Array.isArray(query.cardIds) ? query.cardIds : [query.cardIds])
    : undefined;
  const user = await requireTrackedUser(`/decks/${slug}/study`);
  const locale = await getLocale();

  const deck = await prisma.deck.findFirst({
    where: { slug, ...deckAccessWhere(user) },
    include: {
      cards: {
        orderBy: { order: "asc" },
        include: {
          progress: {
            where: { userId: user.id },
            select: { isGood: true, timesGood: true },
          },
        },
      },
    },
  });
  if (!deck || deck.cards.length === 0) notFound();

  const studyCards = selectStudyCards(deck.cards, selectedIds);
  if (studyCards.length === 0) notFound();

  return (
    <div className="mx-auto mt-12 max-w-xl px-6">
      <StudySession
        deckSlug={deck.slug}
        deckTitle={deck.title}
        cards={studyCards.map((card) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          isGood: card.progress[0]?.isGood ?? false,
          previouslyGood: (card.progress[0]?.timesGood ?? 0) > 0,
        }))}
        locale={locale}
      />
    </div>
  );
}
