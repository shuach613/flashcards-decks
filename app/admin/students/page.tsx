import { DeckProgress } from "@/components/deck-progress";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getCardStudyStatus, summarizeProgress } from "@/lib/progress";
import { AdminSubnav } from "../_components/admin-subnav";

type SearchParams = Promise<{ email?: string | string[] }>;

export default async function StudentOverviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const locale = await getLocale();
  const rawEmail = (await searchParams).email;
  const email = (Array.isArray(rawEmail) ? rawEmail[0] : rawEmail)
    ?.trim()
    .toLowerCase();

  const student = email
    ? await prisma.user.findFirst({
        where: { email, role: "USER" },
        select: { id: true, email: true, createdAt: true },
      })
    : null;

  const activity = student
    ? await prisma.studyProgress.findMany({
        where: { userId: student.id },
        orderBy: { lastStudiedAt: "desc" },
        include: {
          deck: {
            include: {
              certificate: true,
              cards: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  front: true,
                  progress: {
                    where: { userId: student.id },
                    select: {
                      isGood: true,
                      timesGood: true,
                      timesAgain: true,
                      updatedAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    : [];

  const dateLocale = locale === "de" ? "de-CH" : "en-US";

  return (
    <div className="mx-auto mt-12 max-w-3xl px-6 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
        {t(locale, "admin.heading")}
      </h1>
      <AdminSubnav active="students" locale={locale} />

      <section>
        <h2 className="text-xl font-bold tracking-tight text-evergreen">
          {t(locale, "admin.studentOverview")}
        </h2>
        <p className="mt-1 text-dark-gray">
          {t(locale, "admin.studentOverviewBody")}
        </p>

        <form
          action="/admin/students"
          method="get"
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <div className="min-w-0 flex-1">
            <label
              htmlFor="student-email"
              className="block text-sm font-medium text-evergreen"
            >
              {t(locale, "admin.studentEmail")}
            </label>
            <input
              id="student-email"
              name="email"
              type="email"
              required
              defaultValue={email}
              className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
            />
          </div>
          <button
            type="submit"
            className="self-start rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110 sm:mt-6"
          >
            {t(locale, "admin.searchStudent")}
          </button>
        </form>
      </section>

      {email && !student && (
        <p className="mt-8 rounded-2xl border border-sand bg-white p-5 text-dark-gray shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
          {t(locale, "admin.studentNotFound")}
        </p>
      )}

      {student && (
        <section className="mt-8">
          <div className="rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
            <h3 className="font-bold text-evergreen">{student.email}</h3>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-dark-gray">
              <span>
                {t(locale, "admin.studentSince", {
                  date: student.createdAt.toLocaleDateString(dateLocale),
                })}
              </span>
              <span>{tc(locale, "admin.decksStudied", activity.length)}</span>
            </div>
          </div>

          {activity.length === 0 ? (
            <p className="mt-4 text-dark-gray">
              {t(locale, "admin.noStudyActivity")}
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {activity.map((study) => {
                const cards = study.deck.cards.map((card) => ({
                  id: card.id,
                  isGood: card.progress[0]?.isGood ?? false,
                }));
                const summary = summarizeProgress(cards);

                return (
                  <li
                    key={study.id}
                    className="rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-evergreen">
                            {study.deck.title}
                          </h3>
                          <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-dark-gray">
                            {study.deck.certificate?.name ??
                              t(locale, "common.uncategorized")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-dark-gray">
                          {t(locale, "admin.lastStudied", {
                            date: study.lastStudiedAt.toLocaleDateString(
                              dateLocale
                            ),
                          })}
                          {" · "}
                          {tc(
                            locale,
                            "admin.completedSessions",
                            study.timesStudied
                          )}
                        </p>
                      </div>
                      {summary.isComplete && (
                        <span className="rounded-full bg-bright-green px-2.5 py-1 text-xs font-semibold text-evergreen">
                          ✓ {t(locale, "deck.done")}
                        </span>
                      )}
                    </div>

                    <DeckProgress
                      goodCount={summary.goodCount}
                      totalCount={summary.totalCount}
                      label={t(locale, "deck.progress", {
                        good: summary.goodCount,
                        total: summary.totalCount,
                      })}
                      progressLabel={t(locale, "study.progressLabel")}
                    />

                    <details className="mt-4 border-t border-sand pt-3">
                      <summary className="cursor-pointer text-sm font-semibold text-evergreen">
                        {t(locale, "admin.viewCardDetails")}
                      </summary>
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead className="text-xs tracking-wide text-dark-gray uppercase">
                            <tr>
                              <th className="pb-2 pr-4 font-semibold">
                                {t(locale, "admin.card")}
                              </th>
                              <th className="px-3 pb-2 font-semibold">
                                {t(locale, "admin.status")}
                              </th>
                              <th className="px-3 pb-2 text-center font-semibold">
                                {t(locale, "admin.timesGood")}
                              </th>
                              <th className="px-3 pb-2 text-center font-semibold">
                                {t(locale, "admin.timesAgain")}
                              </th>
                              <th className="pb-2 pl-3 font-semibold">
                                {t(locale, "admin.lastActivity")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {study.deck.cards.map((card) => {
                              const cardProgress = card.progress[0];
                              const status = getCardStudyStatus(cardProgress);
                              const statusLabel =
                                status === "good"
                                  ? t(locale, "admin.cardGood")
                                  : status === "needs-study"
                                    ? t(locale, "admin.cardNeedsStudy")
                                    : t(locale, "admin.cardNotReviewed");

                              return (
                                <tr key={card.id} className="border-t border-sand">
                                  <td className="py-3 pr-4 text-evergreen">
                                    {card.front}
                                  </td>
                                  <td className="px-3 py-3">
                                    <span
                                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                        status === "good"
                                          ? "bg-bright-green text-evergreen"
                                          : status === "needs-study"
                                            ? "bg-sunset-orange/10 text-sunset-orange"
                                            : "bg-sand text-dark-gray"
                                      }`}
                                    >
                                      {statusLabel}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-center text-dark-gray">
                                    {cardProgress?.timesGood ?? 0}
                                  </td>
                                  <td className="px-3 py-3 text-center text-dark-gray">
                                    {cardProgress?.timesAgain ?? 0}
                                  </td>
                                  <td className="py-3 pl-3 text-dark-gray">
                                    {cardProgress
                                      ? cardProgress.updatedAt.toLocaleDateString(
                                          dateLocale
                                        )
                                      : t(locale, "admin.noActivity")}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
