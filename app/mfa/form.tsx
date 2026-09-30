"use client";

import { useActionState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { verifyMfaLogin, type MfaLoginState } from "./actions";

export function MfaLoginForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState<MfaLoginState, FormData>(
    verifyMfaLogin,
    undefined
  );
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="mfa-code" className="text-sm font-medium text-brand-primary">
        {t(locale, "auth.mfaCodeLabel")}
      </label>
      <input
        id="mfa-code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9A-Za-z -]+"
        required
        autoFocus
        className="w-full rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
      />
      {state?.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? t(locale, "common.savePending") : t(locale, "auth.mfaContinue")}
      </button>
      <p className="text-xs text-text-muted">{t(locale, "auth.mfaRecoveryHint")}</p>
    </form>
  );
}
