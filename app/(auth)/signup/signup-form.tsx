"use client";

import { useActionState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { signup } from "./actions";
import { DEFAULT_TRACKS } from "@/lib/tracks";

export function SignupForm({
  callbackUrl,
  locale,
}: {
  callbackUrl: string;
  locale: Locale;
}) {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <label className="block text-sm font-medium text-evergreen" htmlFor="email">
          {t(locale, "auth.emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-evergreen" htmlFor="password">
          {t(locale, "auth.passwordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
        />
        <p className="mt-1 text-xs text-dark-gray">{t(locale, "auth.passwordHint")}</p>
      </div>
      <fieldset>
        <legend className="block text-sm font-medium text-evergreen">
          {t(locale, "auth.trackLabel")}
        </legend>
        <div className="mt-2 space-y-2">
          {DEFAULT_TRACKS.map((track) => (
            <label
              key={track.key}
              className="flex cursor-pointer gap-2 rounded-xl border border-soft-gray px-3.5 py-2.5 text-sm transition has-checked:border-evergreen has-checked:bg-lime-green/60"
            >
              <input
                type="radio"
                name="track"
                value={track.key}
                required
                className="accent-evergreen"
              />
              <span className="font-medium text-evergreen">{track.name}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-dark-gray">
          {t(locale, "auth.trackHint")}
        </p>
      </fieldset>
      {state?.error && <p className="text-sm text-sunset-orange">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
      >
        {pending
          ? t(locale, "auth.signupButtonPending")
          : t(locale, "auth.signupButton")}
      </button>
    </form>
  );
}
