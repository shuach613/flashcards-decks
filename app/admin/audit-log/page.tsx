import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import { AdminSubnav } from "../_components/admin-subnav";

export default async function AuditLogPage() {
  await requireAdmin();
  const locale = await getLocale();
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const dateLocale = locale === "de" ? "de-CH" : "en-US";

  return (
    <div className="mx-auto mt-12 max-w-4xl px-6 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-brand-primary">
        {t(locale, "admin.heading")}
      </h1>
      <AdminSubnav active="audit" locale={locale} />
      <section className="rounded-2xl border border-neutral-muted bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h2 className="text-xl font-bold tracking-tight text-brand-primary">
          {t(locale, "admin.auditLog")}
        </h2>
        <p className="mt-1 text-text-muted">{t(locale, "admin.auditLogBody")}</p>
        {entries.length === 0 ? (
          <p className="mt-6 text-text-muted">{t(locale, "admin.noAuditEntries")}</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs tracking-wide text-text-muted uppercase">
                <tr>
                  <th className="pb-2 pr-4 font-semibold">{t(locale, "admin.auditWhen")}</th>
                  <th className="px-3 pb-2 font-semibold">{t(locale, "admin.auditActor")}</th>
                  <th className="px-3 pb-2 font-semibold">{t(locale, "admin.auditAction")}</th>
                  <th className="pb-2 pl-3 font-semibold">{t(locale, "admin.auditTarget")}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-neutral-muted align-top">
                    <td className="py-3 pr-4 whitespace-nowrap text-text-muted">
                      {entry.createdAt.toLocaleString(dateLocale)}
                    </td>
                    <td className="px-3 py-3 text-brand-primary">{entry.actorEmail}</td>
                    <td className="px-3 py-3 font-semibold text-brand-primary">{entry.action}</td>
                    <td className="py-3 pl-3 text-text-muted">
                      {entry.targetType}{entry.targetId ? ` · ${entry.targetId}` : ""}
                      {entry.metadata ? (
                        <details className="mt-1 text-xs">
                          <summary className="cursor-pointer">Details</summary>
                          <pre className="mt-1 whitespace-pre-wrap">{entry.metadata}</pre>
                        </details>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
