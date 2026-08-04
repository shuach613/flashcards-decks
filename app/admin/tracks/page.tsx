import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { ensureDefaultTracks } from "@/lib/tracks-server";
import { AdminSubnav } from "../_components/admin-subnav";
import { updateStudentTracks } from "./actions";

type SearchParams = Promise<{
  email?: string | string[];
  saved?: string;
  error?: string;
}>;

export default async function TrackManagementPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  await ensureDefaultTracks();
  const locale = await getLocale();
  const params = await searchParams;
  const rawEmail = params.email;
  const email = (Array.isArray(rawEmail) ? rawEmail[0] : rawEmail)
    ?.trim()
    .toLowerCase();

  const [tracks, student] = await Promise.all([
    prisma.track.findMany({
      orderBy: { order: "asc" },
      include: {
        certificates: {
          include: { certificate: true },
          orderBy: { certificate: { order: "asc" } },
        },
      },
    }),
    email
      ? prisma.user.findFirst({
          where: { email, role: "USER" },
          select: {
            id: true,
            email: true,
            tracks: { select: { trackId: true } },
          },
        })
      : null,
  ]);
  const assignedIds = new Set(student?.tracks.map((item) => item.trackId));

  return (
    <div className="mx-auto mt-12 max-w-3xl px-6 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
        {t(locale, "admin.heading")}
      </h1>
      <AdminSubnav active="tracks" locale={locale} />

      <section>
        <h2 className="text-xl font-bold tracking-tight text-evergreen">
          {t(locale, "admin.trackManagement")}
        </h2>
        <p className="mt-1 text-dark-gray">
          {t(locale, "admin.trackManagementBody")}
        </p>

        <form
          action="/admin/tracks"
          method="get"
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <div className="min-w-0 flex-1">
            <label
              htmlFor="track-student-email"
              className="block text-sm font-medium text-evergreen"
            >
              {t(locale, "admin.studentEmail")}
            </label>
            <input
              id="track-student-email"
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
        <section className="mt-8 rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
          <h3 className="font-bold text-evergreen">{student.email}</h3>
          <p className="mt-1 text-sm text-dark-gray">
            {t(locale, "admin.trackSelectionHint")}
          </p>

          {params.saved === "1" && (
            <p className="mt-4 rounded-xl bg-lime-green px-4 py-3 text-sm font-semibold text-evergreen">
              {t(locale, "admin.tracksSaved")}
            </p>
          )}
          {params.error && (
            <p className="mt-4 rounded-xl bg-almond px-4 py-3 text-sm font-semibold text-sunset-orange">
              {params.error === "required"
                ? t(locale, "admin.oneTrackRequired")
                : t(locale, "admin.trackUpdateFailed")}
            </p>
          )}

          <form
            action={updateStudentTracks.bind(null, student.id, student.email)}
            className="mt-5"
          >
            <fieldset className="space-y-3">
              <legend className="sr-only">
                {t(locale, "admin.assignedTracks")}
              </legend>
              {tracks.map((track) => (
                <label
                  key={track.id}
                  className="flex cursor-pointer gap-3 rounded-xl border border-sand p-4 transition has-checked:border-evergreen has-checked:bg-lime-green/60"
                >
                  <input
                    type="checkbox"
                    name="trackIds"
                    value={track.id}
                    defaultChecked={assignedIds.has(track.id)}
                    className="mt-1 size-4 accent-evergreen"
                  />
                  <span>
                    <span className="block font-bold text-evergreen">
                      {track.name}
                    </span>
                    <span className="mt-1 block text-sm text-dark-gray">
                      {track.certificates
                        .map((item) => item.certificate.name)
                        .join(" · ")}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            <button
              type="submit"
              className="mt-5 rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
            >
              {t(locale, "admin.saveTracks")}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
