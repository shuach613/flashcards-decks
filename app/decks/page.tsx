import Link from "next/link";
import { LANGUAGE_VALUES } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { DeckProgress } from "@/components/deck-progress";
import { DeckDifficultyIndicator } from "@/components/deck-difficulty";
import { getDeckStudyState, summarizeProgress } from "@/lib/progress";
import { restartDeckAndStudy } from "@/app/decks/[slug]/study/actions";
import { requireTrackedUser } from "@/lib/authz";

type DeckRow = {
  id: string;
  slug: string;
  title: string;
  language: string;
  difficulty: string;
  studyProgress: { id: string }[];
  cards: { id: string; progress: { isGood: boolean }[] }[];
};

function groupByLanguage(decks: DeckRow[]) {
  return LANGUAGE_VALUES.map((language) => ({
    language,
    decks: decks.filter((d) => d.language === language),
  })).filter((group) => group.decks.length > 0);
}

export default async function AllDecksPage() {
  const user = await requireTrackedUser("/decks");
  const locale = await getLocale();

  const categoryAccess =
    user.role === "ADMIN"
      ? {}
      : {
          tracks: {
            some: { track: { users: { some: { userId: user.id } } } },
          },
        };

  const [categories, uncategorized] = await Promise.all([
    prisma.category.findMany({
      where: categoryAccess,
      orderBy: { order: "asc" },
      include: {
        decks: {
          orderBy: [{ language: "asc" }, { title: "asc" }],
          include: {
            studyProgress: {
              where: { userId: user.id },
              select: { id: true },
            },
            cards: {
              select: {
                id: true,
                progress: {
                  where: { userId: user.id },
                  select: { isGood: true },
                },
              },
            },
          },
        },
      },
    }),
    user.role === "ADMIN"
      ? prisma.deck.findMany({
          where: { categoryId: null },
          orderBy: [{ language: "asc" }, { title: "asc" }],
          include: {
            studyProgress: {
              where: { userId: user.id },
              select: { id: true },
            },
            cards: {
              select: {
                id: true,
                progress: {
                  where: { userId: user.id },
                  select: { isGood: true },
                },
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const sections = [
    ...categories
      .filter((category) => category.decks.length > 0)
      .map((category) => ({
        name: category.name,
        groups: groupByLanguage(category.decks),
      })),
    ...(uncategorized.length > 0
      ? [{ name: t(locale, "common.uncategorized"), groups: groupByLanguage(uncategorized) }]
      : []),
  ];

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
        {t(locale, "allDecks.title")}
      </h1>
      {sections.length === 0 ? (
        <p className="text-dark-gray">{t(locale, "allDecks.empty")}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <details key={section.name} open className="group">
              <summary className="mb-3 flex cursor-pointer list-none items-center justify-between rounded-xl border border-sand bg-white px-4 py-3 text-lg font-bold text-evergreen shadow-[0_2px_8px_rgba(25,51,37,0.06)] [&::-webkit-details-marker]:hidden">
                <span>{section.name}</span>
                <span className="text-base transition-transform group-open:rotate-180" aria-hidden="true">
                 ⌄
                </span>
              </summary>
              <div className="flex flex-col gap-4">
                {section.groups.map((group) => (
                  <div key={group.language}>
                    <h3 className="mb-2 text-xs font-semibold tracking-wide text-dark-gray uppercase">
                      {t(locale, `language.${group.language}` as "language.EN" | "language.DE")}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {group.decks.map((deck) => {
                        const progress = summarizeProgress(
                          deck.cards.map((card) => ({
                            id: card.id,
                            isGood: card.progress[0]?.isGood ?? false,
                          }))
                        );
                        const state = getDeckStudyState(
                          progress,
                          deck.studyProgress.length > 0
                        );

                        return (
                          <li
                            key={deck.id}
                            className="rounded-2xl border border-sand bg-white px-4 py-3 shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
                          >
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/decks/${deck.slug}`}
                                className="font-semibold text-evergreen hover:underline"
                              >
                                {deck.title}
                              </Link>
                              <DeckDifficultyIndicator
                                difficulty={deck.difficulty}
                                locale={locale}
                              />
                            </div>
                            <DeckProgress
                              goodCount={progress.goodCount}
                              totalCount={progress.totalCount}
                              label={t(locale, "deck.progress", {
                                good: progress.goodCount,
                                total: progress.totalCount,
                              })}
                              progressLabel={t(locale, "study.progressLabel")}
                            />
                            <div className="mt-3 flex items-center justify-between gap-3">
                              {state === "complete" ? (
                                <span className="rounded-full bg-bright-green px-2.5 py-1 text-xs font-semibold text-evergreen">
                                  ✓ {t(locale, "deck.done")}
                                </span>
                              ) : (
                                <span />
                              )}
                              {progress.totalCount > 0 &&
                                (state === "complete" ? (
                                  <form
                                    action={restartDeckAndStudy.bind(
                                      null,
                                      deck.slug
                                    )}
                                  >
                                    <button
                                      type="submit"
                                      className="rounded-full bg-evergreen px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
                                    >
                                      {t(locale, "deck.restart")}
                                    </button>
                                  </form>
                                ) : (
                                  <Link
                                    href={`/decks/${deck.slug}/study`}
                                    className="rounded-full bg-evergreen px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
                                  >
                                    {state === "in-progress"
                                      ? t(locale, "home.continue")
                                      : t(locale, "deck.startStudying")}
                                  </Link>
                                ))}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
