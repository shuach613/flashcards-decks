import Link from "next/link";
import { notFound } from "next/navigation";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getDeckStudyState, summarizeProgress } from "@/lib/progress";
import { prisma } from "@/lib/db";
import { DeckProgress } from "@/components/deck-progress";
import { restartDeckAndStudy } from "./study/actions";
import { requireTrackedUser } from "@/lib/authz";
import { deckAccessWhere } from "@/lib/tracks-server";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireTrackedUser(`/decks/${slug}`);
  const locale = await getLocale();

  const deck = await prisma.deck.findFirst({
    where: { slug, ...deckAccessWhere(user) },
    include: {
      cards: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          progress: {
            where: { userId: user.id },
            select: { isGood: true },
          },
        },
      },
      studyProgress: {
        where: { userId: user.id },
        select: { id: true },
      },
    },
  });
  if (!deck) notFound();

  const progress = summarizeProgress(
    deck.cards.map((card) => ({
      id: card.id,
      isGood: card.progress[0]?.isGood ?? false,
    }))
  );
  const state = getDeckStudyState(progress, deck.studyProgress.length > 0);

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
          {progress.isComplete && (
            <span className="rounded-full bg-bright-green px-2.5 py-1 font-semibold text-evergreen">
              ✓ {t(locale, "deck.done")}
            </span>
          )}
        </div>
        {progress.totalCount > 0 && (
          <DeckProgress
            goodCount={progress.goodCount}
            totalCount={progress.totalCount}
            label={t(locale, "deck.progress", {
              good: progress.goodCount,
              total: progress.totalCount,
            })}
            progressLabel={t(locale, "study.progressLabel")}
          />
        )}
        {progress.totalCount === 0 ? (
          <p className="mt-6 text-dark-gray">{t(locale, "deck.noCards")}</p>
        ) : (
          state === "complete" ? (
            <form
              action={restartDeckAndStudy.bind(null, deck.slug)}
              className="mt-6"
            >
              <button
                type="submit"
                className="rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
              >
                {t(locale, "deck.restart")}
              </button>
            </form>
          ) : (
            <Link
              href={`/decks/${deck.slug}/study`}
              className="mt-6 inline-block rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
            >
              {state === "in-progress"
                ? t(locale, "deck.continueStudying")
                : t(locale, "deck.startStudying")}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
