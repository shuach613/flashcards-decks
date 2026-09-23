"use client";

import { useActionState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { chooseTrack } from "./actions";

export function TrackForm({
  callbackUrl,
  locale,
  tracks,
}: {
  callbackUrl: string;
  locale: Locale;
  tracks: { id: string; name: string; categoryNames: string[] }[];
}) {
  const [state, formAction, pending] = useActionState(chooseTrack, undefined);

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <fieldset className="space-y-3">
        <legend className="sr-only">{t(locale, "track.chooseTitle")}</legend>
        {tracks.map((track) => (
          <label
            key={track.id}
            className="flex cursor-pointer gap-3 rounded-2xl border border-sand bg-white p-4 transition hover:border-evergreen/40 has-checked:border-evergreen has-checked:bg-lime-green/60 has-focus-visible:ring-4 has-focus-visible:ring-evergreen/10"
          >
            <input
              type="radio"
              name="trackId"
              value={track.id}
              required
              className="mt-1 size-4 accent-evergreen"
            />
            <span>
              <span className="block font-bold text-evergreen">{track.name}</span>
              <span className="mt-1 block text-sm text-dark-gray">
                {track.categoryNames.length > 0
                  ? track.categoryNames.join(" · ")
                  : t(locale, "track.noCategories")}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      {tracks.length === 0 && (
        <p className="mt-3 text-sm text-sunset-orange">
          {t(locale, "auth.noTracksAvailable")}
        </p>
      )}
      {state?.error && (
        <p className="mt-3 text-sm text-sunset-orange">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending || tracks.length === 0}
        className="mt-5 w-full rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? t(locale, "track.saving") : t(locale, "track.continue")}
      </button>
    </form>
  );
}
