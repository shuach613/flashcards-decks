import { DeckDifficultyIndicator } from "@/components/deck-difficulty";
import { DeckProgress } from "@/components/deck-progress";
import { LanguageIndicator } from "@/components/language-indicator";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getCardStudyStatus, summarizeProgress } from "@/lib/progress";
import { canStudentAccessDeck, matchesStudentSearch } from "@/lib/admin-student-overview";
import { AdminSubnav } from "../_components/admin-subnav";
import { UserManagementActions } from "./user-management-actions";

type SearchParams = Promise<{ q?: string | string[] }>;

export default async function StudentOverviewPage({ searchParams }: { searchParams: SearchParams }) {
  const currentUser = await requireAdmin();
  const locale = await getLocale();
  const currentAdmin = await prisma.user.findUnique({ where: { id: currentUser.id }, select: { isPrimaryAdmin: true } });
  const manageableUsers = currentAdmin?.isPrimaryAdmin
    ? await prisma.user.findMany({ where: { isPrimaryAdmin: false }, orderBy: { email: "asc" }, select: { id: true, email: true, role: true } })
    : [];
  const rawQuery = (await searchParams).q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim().toLowerCase();

  const [students, decks] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" }, orderBy: { email: "asc" },
      include: { tracks: { include: { track: { include: { categories: { include: { category: true } } } } } } },
    }),
    prisma.deck.findMany({ orderBy: [{ language: "asc" }, { title: "asc" }], include: { category: true, cards: { orderBy: { order: "asc" } } } }),
  ]);

  const studentDetails = await Promise.all(students.map(async (student) => {
    const [studyProgress, cardProgress] = await Promise.all([
      prisma.studyProgress.findMany({ where: { userId: student.id }, select: { deckId: true, lastStudiedAt: true, timesStudied: true } }),
      prisma.cardProgress.findMany({ where: { userId: student.id }, select: { cardId: true, isGood: true, timesGood: true, timesAgain: true, updatedAt: true } }),
    ]);
    const assignedCategories = student.tracks.flatMap((assignment) => assignment.track.categories.map((item) => item.category));
    const categoryIds = new Set(assignedCategories.map((category) => category.id));
    const studyByDeck = new Map(studyProgress.map((progress) => [progress.deckId, progress]));
    const cardById = new Map(cardProgress.map((progress) => [progress.cardId, progress]));
    return {
      ...student,
      trackNames: student.tracks.map((assignment) => assignment.track.name),
      categoryNames: [...new Set(assignedCategories.map((category) => category.name))],
      decks: decks.filter((deck) => canStudentAccessDeck(deck.categoryId, categoryIds)).map((deck) => ({
        ...deck,
        study: studyByDeck.get(deck.id),
        cards: deck.cards.map((card) => ({ ...card, progress: cardById.get(card.id) })),
      })),
    };
  }));
  const visibleStudents = studentDetails.filter((student) =>
    matchesStudentSearch(student.email, student.trackNames, student.categoryNames, query)
  );
  const dateLocale = locale === "de" ? "de-CH" : "en-US";

  return (
    <div className="mx-auto mt-12 max-w-4xl px-6 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-brand-primary">{t(locale, "admin.heading")}</h1>
      <AdminSubnav active="students" locale={locale} />

      {currentAdmin?.isPrimaryAdmin && (
        <section className="mb-10 rounded-2xl border border-neutral-muted bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
          <h2 className="text-xl font-bold tracking-tight text-brand-primary">{t(locale, "admin.userManagement")}</h2>
          <p className="mt-1 text-text-muted">{t(locale, "admin.userManagementBody")}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {manageableUsers.map((user) => (
              <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-muted px-4 py-3">
                <div><p className="font-medium text-brand-primary">{user.email}</p><p className="text-sm text-text-muted">{user.role === "ADMIN" ? t(locale, "admin.adminRole") : t(locale, "admin.studentRole")}</p></div>
                <UserManagementActions userId={user.id} role={user.role} labels={{ makeAdmin: t(locale, "admin.makeAdmin"), revokeAdmin: t(locale, "admin.revokeAdmin"), transferPrimary: t(locale, "admin.transferPrimary"), deleteUser: t(locale, "admin.deleteUser"), transferConfirmation: t(locale, "admin.transferPrimaryConfirmation", { email: user.email }), deleteConfirmation: t(locale, "admin.deleteUserConfirmation", { email: user.email }) }} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold tracking-tight text-brand-primary">{t(locale, "admin.studentOverview")}</h2>
        <p className="mt-1 text-text-muted">{t(locale, "admin.studentOverviewBody")}</p>
        <form action="/admin/students" method="get" className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label htmlFor="student-search" className="block text-sm font-medium text-brand-primary">{t(locale, "admin.studentSearch")}</label>
            <input id="student-search" name="q" type="search" defaultValue={query} placeholder={t(locale, "admin.studentSearchPlaceholder")} className="mt-1 w-full rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" />
          </div>
          <button type="submit" className="self-start rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110 sm:mt-6">{t(locale, "admin.searchStudent")}</button>
        </form>
        <p className="mt-6 text-sm text-text-muted">{tc(locale, "admin.studentsFound", visibleStudents.length)}</p>

        {visibleStudents.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-neutral-muted bg-white p-5 text-text-muted shadow-[0_2px_8px_rgba(25,51,37,0.08)]">{query ? t(locale, "admin.studentNotFound") : t(locale, "admin.noStudents")}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {visibleStudents.map((student) => (
              <li key={student.id}>
                <details className="rounded-2xl border border-neutral-muted bg-white shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
                  <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><h3 className="font-bold text-brand-primary">{student.email}</h3><p className="mt-1 text-sm text-text-muted">{student.trackNames.length > 0 ? student.trackNames.join(" · ") : t(locale, "admin.noTrack")}</p></div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-muted"><span className="rounded-full bg-surface-muted px-2.5 py-1">{tc(locale, "admin.categoryCount", student.categoryNames.length)}</span><span className="rounded-full bg-surface-muted px-2.5 py-1">{tc(locale, "admin.deckCount", student.decks.length)}</span></div>
                    </div>
                  </summary>
                  <div className="border-t border-neutral-muted px-5 pb-5 pt-4">
                    <p className="text-sm text-text-muted">{t(locale, "admin.assignedCategories")}: {student.categoryNames.length > 0 ? student.categoryNames.join(" · ") : t(locale, "admin.noCategories")}</p>
                    {student.decks.length === 0 ? <p className="mt-4 text-text-muted">{t(locale, "admin.noAccessibleDecks")}</p> : (
                      <ul className="mt-4 flex flex-col gap-3">
                        {student.decks.map((deck) => {
                          const summary = summarizeProgress(deck.cards.map((card) => ({ id: card.id, isGood: card.progress?.isGood ?? false })));
                          return (
                            <li key={deck.id}>
                              <details className="rounded-xl border border-neutral-muted">
                                <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
                                  <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-brand-primary">{deck.title}</span><LanguageIndicator language={deck.language} locale={locale} /><DeckDifficultyIndicator difficulty={deck.difficulty} locale={locale} /></div><span className="text-sm text-text-muted">{deck.study ? t(locale, "admin.inProgress") : t(locale, "admin.notStarted")}</span></div>
                                </summary>
                                <div className="border-t border-neutral-muted px-4 pb-4 pt-3">
                                  <DeckProgress goodCount={summary.goodCount} totalCount={summary.totalCount} label={t(locale, "deck.progress", { good: summary.goodCount, total: summary.totalCount })} progressLabel={t(locale, "study.progressLabel")} />
                                  {deck.study && <p className="mt-2 text-sm text-text-muted">{t(locale, "admin.lastStudied", { date: deck.study.lastStudiedAt.toLocaleDateString(dateLocale) })} · {tc(locale, "admin.completedSessions", deck.study.timesStudied)}</p>}
                                  <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-xs tracking-wide text-text-muted uppercase"><tr><th className="pb-2 pr-4 font-semibold">{t(locale, "admin.card")}</th><th className="px-3 pb-2 font-semibold">{t(locale, "admin.status")}</th><th className="px-3 pb-2 text-center font-semibold">{t(locale, "admin.timesGood")}</th><th className="px-3 pb-2 text-center font-semibold">{t(locale, "admin.timesAgain")}</th><th className="pb-2 pl-3 font-semibold">{t(locale, "admin.lastActivity")}</th></tr></thead><tbody>
                                    {deck.cards.map((card) => { const status = getCardStudyStatus(card.progress); const statusLabel = status === "good" ? t(locale, "admin.cardGood") : status === "needs-study" ? t(locale, "admin.cardNeedsStudy") : t(locale, "admin.cardNotReviewed"); const statusClass = status === "good" ? "bg-surface-accent text-brand-primary" : status === "needs-study" ? "bg-red-100 text-red-700" : "bg-surface-muted text-text-muted"; return <tr key={card.id} className="border-t border-neutral-muted"><td className="py-3 pr-4 text-brand-primary">{card.front}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass}`}>{statusLabel}</span></td><td className="px-3 py-3 text-center text-text-muted">{card.progress?.timesGood ?? 0}</td><td className="px-3 py-3 text-center text-text-muted">{card.progress?.timesAgain ?? 0}</td><td className="py-3 pl-3 text-text-muted">{card.progress ? card.progress.updatedAt.toLocaleDateString(dateLocale) : t(locale, "admin.noActivity")}</td></tr>; })}
                                  </tbody></table></div>
                                </div>
                              </details>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
