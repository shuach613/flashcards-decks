import Link from "next/link";
import { auth } from "@/auth";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { summarizeProgress } from "@/lib/progress";
import { prisma } from "@/lib/db";

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

  const progress = await prisma.studyProgress.findMany({
    where: { userId: session.user.id },
    include: {
      deck: {
        include: {
          certificate: true,
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
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-evergreen">{p.deck.title}</p>
                      <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-dark-gray">
                        {p.deck.certificate?.name ??
                          t(locale, "common.uncategorized")}
                      </span>
                    </div>
                    <p className="text-sm text-dark-gray">
                      {tc(locale, "home.lastStudied", p.timesStudied, {
                        date: p.lastStudiedAt.toLocaleDateString(),
                      })}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-dark-gray">
                      <span>
                        {t(locale, "home.progress", {
                          good: summary.goodCount,
                          total: summary.totalCount,
                        })}
                      </span>
                      {summary.isComplete && (
                        <span className="rounded-full bg-bright-green px-2 py-0.5 text-xs font-semibold text-evergreen">
                          ✓ {t(locale, "home.done")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/decks/${p.deck.slug}`}
                    className="shrink-0 rounded-full bg-evergreen px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    {t(locale, "home.continue")}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
