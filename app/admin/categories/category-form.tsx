"use client";

import { useActionState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { createCategory } from "./actions";

export function CategoryForm({
  locale,
  tracks,
}: {
  locale: Locale;
  tracks: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createCategory, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
          <label className="block text-sm font-medium text-evergreen" htmlFor="name">
            {t(locale, "common.nameLabel")}
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. Cloud+"
            className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
          />
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-evergreen">
          {t(locale, "category.matchTracks")}
        </legend>
        <p className="mt-1 text-xs text-dark-gray">
          {t(locale, "category.matchTracksHint")}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {tracks.map((track) => (
            <label key={track.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-sand px-3 py-2 text-sm transition has-checked:border-evergreen has-checked:bg-lime-green/60">
              <input
                type="checkbox"
                name="trackIds"
                value={track.id}
                className="size-4 accent-evergreen"
              />
              <span className="font-medium text-evergreen">{track.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {state?.error && <p className="text-sm text-sunset-orange">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="self-start rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? t(locale, "common.addPending") : t(locale, "common.add")}
      </button>
    </form>
  );
}
