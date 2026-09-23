import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { summarizeProgress } from "@/lib/progress";
import { prisma } from "@/lib/db";
import { DeckProgress } from "@/components/deck-progress";
import { DeckDifficultyIndicator } from "@/components/deck-difficulty";
import { restartDeckAndStudy } from "@/app/decks/[slug]/study/actions";
import {
  deckAccessWhere,
  userHasTracks,
} from "@/lib/tracks-server";

export default async function HomePage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    return (
      <div className="mx-auto mt-16 max-w-xl px-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          {t(locale, "home.title")}
        </h1>
        <p className="mt-4 text-dark-gray">{t(locale, "home.loggedOutBody")}</p>
      </div>
    );
  }

  if (
    session.user.role !== "ADMIN" &&
    !(await userHasTracks(session.user.id))
  ) {
    redirect("/choose-track");
  }

  const progress = await prisma.studyProgress.findMany({
    where: {
      userId: session.user.id,
      deck: deckAccessWhere(session.user),
    },
    include: {
      deck: {
        include: {
          category: true,
          cards: {
            select: {
              id: true,
              progress: {
                where: { userId: session.user.id },
                select: { isGood: true },
              },
            },
          },
        },
      },
    },
    orderBy: { lastStudiedAt: "desc" },
  });

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
        {t(locale, "home.yourDecks")}
      </h1>
      {progress.length === 0 ? (
        <p className="text-dark-gray">{t(locale, "home.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {progress.map((p) => {
            const summary = summarizeProgress(
              p.deck.cards.map((card) => ({
                id: card.id,
                isGood: card.progress[0]?.isGood ?? false,
              }))
            );

            return (
              <li
                key={p.id}
                className="rounded-2xl border border-sand bg-white p-4 shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
              >
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-evergreen">{p.deck.title}</p>
                        <DeckDifficultyIndicator difficulty={p.deck.difficulty} locale={locale} />
                      </div>
                      <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-dark-gray">
                        {p.deck.category?.name ??
                          t(locale, "common.uncategorized")}
                      </span>
                    </div>
                    <p className="text-sm text-dark-gray">
                      {tc(locale, "home.lastStudied", p.timesStudied, {
                        date: p.lastStudiedAt.toLocaleDateString(),
                      })}
                    </p>
                    <DeckProgress
                      goodCount={summary.goodCount}
                      totalCount={summary.totalCount}
                      label={t(locale, "home.progress", {
                        good: summary.goodCount,
                        total: summary.totalCount,
                      })}
                      progressLabel={t(locale, "study.progressLabel")}
                    />
                    {summary.isComplete && (
                      <span className="mt-2 inline-block rounded-full bg-bright-green px-2 py-0.5 text-xs font-semibold text-evergreen">
                        ✓ {t(locale, "home.done")}
                      </span>
                    )}
                  </div>
                  {summary.isComplete ? (
                    <form action={restartDeckAndStudy.bind(null, p.deck.slug)}>
                      <button
                        type="submit"
                        className="shrink-0 rounded-full bg-evergreen px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
                      >
                        {t(locale, "home.restart")}
                      </button>
                    </form>
                  ) : (
                    <Link
                      href={`/decks/${p.deck.slug}/study`}
                      className="shrink-0 rounded-full bg-evergreen px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
                    >
                      {t(locale, "home.continue")}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
