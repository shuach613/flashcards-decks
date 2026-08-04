import { redirect } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import { userHasTracks } from "@/lib/tracks-server";
import { TrackForm } from "./track-form";

export default async function ChooseTrackPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const user = await requireUser();
  const locale = await getLocale();
  const { callbackUrl = "/" } = await searchParams;

  if (user.role === "ADMIN" || (await userHasTracks(user.id))) redirect("/");

  return (
    <div className="mx-auto mt-12 max-w-xl px-6 pb-16">
      <div className="rounded-2xl border border-sand bg-white p-6 shadow-[0_2px_8px_rgba(25,51,37,0.08)] sm:p-8">
        <span className="inline-flex rounded-full bg-bright-green px-3 py-1 text-xs font-bold text-evergreen">
          {t(locale, "track.required")}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-evergreen">
          {t(locale, "track.chooseTitle")}
        </h1>
        <p className="mt-2 text-dark-gray">{t(locale, "track.chooseBody")}</p>
        <TrackForm callbackUrl={callbackUrl} locale={locale} />
      </div>
    </div>
  );
}
