"use client";

import { useActionState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { login } from "./actions";

export function LoginForm({
  callbackUrl,
  locale,
}: {
  callbackUrl: string;
  locale: Locale;
}) {
  const [state, formAction, pending] = useActionState(login, undefined);

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
          required
          className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
        />
      </div>
      {state?.error && <p className="text-sm text-sunset-orange">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
      >
        {pending ? t(locale, "auth.loginButtonPending") : t(locale, "auth.loginButton")}
      </button>
    </form>
  );
}
