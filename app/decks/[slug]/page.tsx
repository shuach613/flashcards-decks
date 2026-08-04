import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { summarizeProgress } from "@/lib/progress";
import { prisma } from "@/lib/db";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/decks/${slug}`)}`);
  }

  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: {
      cards: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          progress: {
            where: { userId: session.user.id },
            select: { isGood: true },
          },
        },
      },
    },
  });
  if (!deck) notFound();

  await prisma.studyProgress.upsert({
    where: { userId_deckId: { userId: session.user.id, deckId: deck.id } },
    create: { userId: session.user.id, deckId: deck.id },
    update: {},
  });

  const progress = summarizeProgress(
    deck.cards.map((card) => ({
      id: card.id,
      isGood: card.progress[0]?.isGood ?? false,
    }))
  );

  return (
    <div className="mx-auto mt-12 max-w-xl px-6">
      <div className="rounded-2xl border border-sand bg-white p-8 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          {deck.title}
        </h1>
        {deck.description && (
          <p className="mt-2 text-dark-gray">{deck.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-dark-gray">
          <span>{tc(locale, "deck.cardCount", progress.totalCount)}</span>
          {progress.totalCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {t(locale, "deck.progress", {
                  good: progress.goodCount,
                  total: progress.totalCount,
                })}
              </span>
            </>
          )}
          {progress.isComplete && (
            <span className="rounded-full bg-bright-green px-2.5 py-1 font-semibold text-evergreen">
              ✓ {t(locale, "deck.done")}
            </span>
          )}
        </div>
        {progress.totalCount === 0 ? (
          <p className="mt-6 text-dark-gray">{t(locale, "deck.noCards")}</p>
        ) : (
          <Link
            href={`/decks/${deck.slug}/study`}
            className="mt-6 inline-block rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
          >
            {progress.isComplete
              ? t(locale, "deck.review")
              : progress.goodCount > 0
                ? t(locale, "deck.continueStudying")
                : t(locale, "deck.startStudying")}
          </Link>
        )}
      </div>
    </div>
  );
}
