import Link from "next/link";
import { requireAdmin } from "@/lib/authz";
import { ensureDefaultTracks } from "@/lib/tracks-server";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { CategoryForm } from "./category-form";
import { deleteCategory } from "./actions";
import { ConfirmActionForm } from "../_components/confirm-action-form";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  await ensureDefaultTracks();
  const locale = await getLocale();

  const [categories, tracks] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { decks: true } },
        tracks: { include: { track: true } },
      },
    }),
    prisma.track.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-primary">
          {t(locale, "category.title")}
        </h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-brand-primary underline underline-offset-4"
        >
          {t(locale, "category.backToDecks")}
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-neutral-muted bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h2 className="mb-3 font-semibold text-brand-primary">
          {t(locale, "category.addCategory")}
        </h2>
        <p className="mb-3 text-sm text-text-muted">{t(locale, "category.addHint")}</p>
        <CategoryForm locale={locale} tracks={tracks} />
      </div>

      <ul className="flex flex-col gap-3">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-muted bg-white p-4 shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
          >
            <div>
              <p className="font-semibold text-brand-primary">{category.name}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {category.tracks.length > 0 ? (
                  category.tracks.map((assignment) => (
                    <span key={assignment.trackId} className="rounded-full bg-surface-accent px-2 py-0.5 text-xs font-medium text-brand-primary">
                      {assignment.track.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-muted">
                    {t(locale, "category.noTracks")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <p className="text-sm text-text-muted">
                {tc(locale, "category.deckCount", category._count.decks)}
              </p>
              <ConfirmActionForm
                action={deleteCategory.bind(null, category.id)}
                confirmation={t(locale, "category.deleteConfirmation", {
                  name: category.name,
                })}
                label={t(locale, "category.deleteCategory")}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
