import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { summarizeProgress } from "@/lib/progress";
import { prisma } from "@/lib/db";
import { DeckProgress } from "@/components/deck-progress";
import { DeckDifficultyIndicator } from "@/components/deck-difficulty";
import { CategorySection } from "@/components/category-section";
import { LanguageIndicator } from "@/components/language-indicator";
import { DeckFilters } from "@/components/deck-filters";
import { LANGUAGE_VALUES } from "@/lib/categories";
import { restartDeckAndStudy } from "@/app/decks/[slug]/study/actions";
import {
  deckAccessWhere,
  userHasTracks,
} from "@/lib/tracks-server";
import { requireVerifiedUser } from "@/lib/authz";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ language?: string; category?: string }>;
}) {
  const session = await auth();
  const locale = await getLocale();
  const query = searchParams ? await searchParams : undefined;
  const languageFilter = LANGUAGE_VALUES.includes(
    query?.language as (typeof LANGUAGE_VALUES)[number]
  )
    ? query?.language
    : undefined;
  const categoryFilter = query?.category?.trim() || undefined;

  if (!session?.user) {
    return (
      <div className="mx-auto mt-16 max-w-xl px-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-primary">
          {t(locale, "home.title")}
        </h1>
        <p className="mt-4 text-text-muted">{t(locale, "home.loggedOutBody")}</p>
      </div>
    );
  }

  const user = await requireVerifiedUser();
  if (user.role !== "ADMIN" && !(await userHasTracks(user.id))) {
    redirect("/choose-track");
  }

  const progress = await prisma.studyProgress.findMany({
    where: {
      userId: user.id,
      deck: deckAccessWhere(user),
    },
    include: {
      deck: {
        include: {
          category: true,
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
    orderBy: { lastStudiedAt: "desc" },
  });

  const categoryOptions: { id: string; name: string }[] = [];
  for (const entry of progress) {
    const id = entry.deck.category?.id ?? "uncategorized";
    const name = entry.deck.category?.name ?? t(locale, "common.uncategorized");
    if (!categoryOptions.some((option) => option.id === id)) {
      categoryOptions.push({ id, name });
    }
  }

  const filteredProgress = progress.filter(
    (entry) =>
      (!languageFilter || entry.deck.language === languageFilter) &&
      (!categoryFilter ||
        (entry.deck.category?.id ?? "uncategorized") === categoryFilter)
  );
  const sections: { name: string; decks: typeof progress }[] = [];
  for (const entry of filteredProgress) {
    const name = entry.deck.category?.name ?? t(locale, "common.uncategorized");
    const section = sections.find((candidate) => candidate.name === name);
    if (section) {
      section.decks.push(entry);
    } else {
      sections.push({ name, decks: [entry] });
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl px-4 pb-10 sm:mt-12 sm:px-6 sm:pb-0">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-brand-primary">
        {t(locale, "home.yourDecks")}
      </h1>
      <DeckFilters
        action="/"
        categories={categoryOptions}
        category={categoryFilter}
        language={languageFilter}
        locale={locale}
      />
      {filteredProgress.length === 0 ? (
        <p className="text-text-muted">
          {languageFilter || categoryFilter
            ? t(locale, "deckFilters.noMatches")
            : t(locale, "home.empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {sections.map((section) => (
            <CategorySection key={section.name} name={section.name}>
              <ul className="flex flex-col gap-3">
          {section.decks.map((p) => {
            const summary = summarizeProgress(
              p.deck.cards.map((card) => ({
                id: card.id,
                isGood: card.progress[0]?.isGood ?? false,
              }))
            );

            return (
              <li
                key={p.id}
                className="rounded-2xl border border-neutral-muted bg-white p-4 shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="min-w-0 break-words font-semibold text-brand-primary">{p.deck.title}</p>
                        <LanguageIndicator language={p.deck.language} locale={locale} />
                        <DeckDifficultyIndicator difficulty={p.deck.difficulty} locale={locale} />
                      </div>
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-muted sm:max-w-full">
                        {p.deck.category?.name ??
                          t(locale, "common.uncategorized")}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">
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
                      <span className="mt-2 inline-block rounded-full bg-brand-highlight px-2 py-0.5 text-xs font-semibold text-brand-primary">
                        ✓ {t(locale, "home.done")}
                      </span>
                    )}
                  </div>
                  {summary.isComplete ? (
                    <form action={restartDeckAndStudy.bind(null, p.deck.slug)}>
                      <button
                        type="submit"
                        className="min-h-11 w-full rounded-full bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto sm:min-h-0"
                      >
                        {t(locale, "home.restart")}
                      </button>
                    </form>
                  ) : (
                    <Link
                      href={`/decks/${p.deck.slug}/study`}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto sm:min-h-0"
                    >
                      {t(locale, "home.continue")}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
              </ul>
            </CategorySection>
          ))}
        </div>
      )}
    </div>
  );
}
