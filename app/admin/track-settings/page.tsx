import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { ensureDefaultTracks } from "@/lib/tracks-server";
import { AdminSubnav } from "../_components/admin-subnav";
import { createTrack, updateTrack } from "./actions";

type SearchParams = Promise<{
  created?: string;
  saved?: string;
  track?: string;
  error?: string;
}>;

function messageForError(locale: "en" | "de", error?: string) {
  if (error === "name") return t(locale, "tracks.nameRequired");
  if (error === "duplicate") return t(locale, "tracks.nameExists");
  if (error) return t(locale, "tracks.updateFailed");
  return null;
}

export default async function TrackConfigurationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  await ensureDefaultTracks();
  const [locale, params, categories, tracks] = await Promise.all([
    getLocale(),
    searchParams,
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.track.findMany({
      orderBy: { order: "asc" },
      include: { categories: { select: { categoryId: true } } },
    }),
  ]);
  const errorMessage = messageForError(locale, params.error);

  return (
    <div className="mx-auto mt-12 max-w-3xl px-6 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
        {t(locale, "admin.heading")}
      </h1>
      <AdminSubnav active="track-settings" locale={locale} />

      <section>
        <h2 className="text-xl font-bold tracking-tight text-evergreen">
          {t(locale, "admin.trackConfiguration")}
        </h2>
        <p className="mt-1 text-dark-gray">
          {t(locale, "admin.trackConfigurationBody")}
        </p>
      </section>

      {params.created === "1" && (
        <p className="mt-5 rounded-xl bg-lime-green px-4 py-3 text-sm font-semibold text-evergreen">
          {t(locale, "tracks.created")}
        </p>
      )}
      {errorMessage && !params.track && (
        <p className="mt-5 rounded-xl bg-almond px-4 py-3 text-sm font-semibold text-sunset-orange">
          {errorMessage}
        </p>
      )}

      <section className="mt-6 rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h3 className="font-bold text-evergreen">{t(locale, "tracks.addTrack")}</h3>
        <form action={createTrack} className="mt-4">
          <label htmlFor="new-track-name" className="block text-sm font-medium text-evergreen">
            {t(locale, "common.nameLabel")}
          </label>
          <input
            id="new-track-name"
            name="name"
            required
            className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
          />
          <CategoryChoices
            legend={t(locale, "tracks.availableCategories")}
            categories={categories}
            emptyLabel={t(locale, "tracks.noCategories")}
          />
          <button type="submit" className="mt-5 rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110">
            {t(locale, "tracks.create")}
          </button>
        </form>
      </section>

      <div className="mt-6 space-y-4">
        {tracks.map((track) => {
          const selectedIds = new Set(
            track.categories.map((item) => item.categoryId)
          );
          const selectedCategories = categories.filter((category) =>
            selectedIds.has(category.id)
          );
          const hasMessage = params.track === track.id;

          return (
            <details
              key={track.id}
              open={hasMessage || undefined}
              className="group overflow-hidden rounded-2xl border border-sand bg-white shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 outline-none transition hover:bg-light-gray focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-evergreen/10 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="block font-bold text-evergreen">
                    {track.name}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {selectedCategories.length > 0 ? (
                      selectedCategories.map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full bg-lime-green px-2 py-0.5 text-xs font-medium text-evergreen"
                        >
                          {category.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-dark-gray">
                        {t(locale, "track.noCategories")}
                      </span>
                    )}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-evergreen">
                  {t(locale, "tracks.expandSettings")}
                  <span
                    aria-hidden="true"
                    className="text-lg transition-transform group-open:rotate-180"
                  >
                    ⌄
                  </span>
                </span>
              </summary>
              <div className="border-t border-sand p-5">
                <form action={updateTrack.bind(null, track.id)}>
                <label htmlFor={`track-name-${track.id}`} className="block text-sm font-medium text-evergreen">
                  {t(locale, "tracks.trackName")}
                </label>
                <input
                  id={`track-name-${track.id}`}
                  name="name"
                  required
                  defaultValue={track.name}
                  className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 font-semibold text-evergreen outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
                />
                <CategoryChoices
                  legend={t(locale, "tracks.shownCategories")}
                  categories={categories}
                  selectedIds={selectedIds}
                  emptyLabel={t(locale, "tracks.noCategories")}
                />
                {hasMessage && params.saved === "1" && (
                  <p className="mt-4 rounded-xl bg-lime-green px-4 py-3 text-sm font-semibold text-evergreen">
                    {t(locale, "tracks.saved")}
                  </p>
                )}
                {hasMessage && errorMessage && (
                  <p className="mt-4 rounded-xl bg-almond px-4 py-3 text-sm font-semibold text-sunset-orange">
                    {errorMessage}
                  </p>
                )}
                <button type="submit" className="mt-5 rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110">
                  {t(locale, "tracks.save")}
                </button>
                </form>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function CategoryChoices({
  legend,
  categories,
  selectedIds = new Set<string>(),
  emptyLabel,
}: {
  legend: string;
  categories: { id: string; name: string }[];
  selectedIds?: Set<string>;
  emptyLabel: string;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-medium text-evergreen">{legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-sand px-3 py-2 text-sm transition has-checked:border-evergreen has-checked:bg-lime-green/60">
            <input
              type="checkbox"
              name="categoryIds"
              value={category.id}
              defaultChecked={selectedIds.has(category.id)}
              className="size-4 accent-evergreen"
            />
            <span className="font-medium text-evergreen">{category.name}</span>
          </label>
        ))}
      </div>
      {categories.length === 0 && (
        <p className="mt-2 text-sm text-dark-gray">{emptyLabel}</p>
      )}
    </fieldset>
  );
}
