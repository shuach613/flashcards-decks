import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { StudySession } from "./study-session";
import { requireTrackedUser } from "@/lib/authz";
import { deckAccessWhere } from "@/lib/tracks-server";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  return (
    <div className="mx-auto mt-12 max-w-xl px-6">
      <StudySession
        deckSlug={deck.slug}
        deckTitle={deck.title}
        cards={deck.cards.map((card) => ({
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
