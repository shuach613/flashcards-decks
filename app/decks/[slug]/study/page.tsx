import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { StudySession } from "./study-session";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/decks/${slug}/study`)}`
    );
  }

  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: { cards: { orderBy: { order: "asc" } } },
  });
  if (!deck || deck.cards.length === 0) notFound();

  return (
    <div className="mx-auto mt-12 max-w-xl px-6">
      <StudySession
        deckSlug={deck.slug}
        deckTitle={deck.title}
        cards={deck.cards.map((c) => ({ id: c.id, front: c.front, back: c.back }))}
        locale={locale}
      />
    </div>
  );
}
