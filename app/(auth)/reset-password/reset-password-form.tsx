"use client";

import { useActionState } from "react";
import { resetPassword } from "./actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="block text-sm font-medium text-brand-primary" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-1 w-full rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-primary" htmlFor="confirmation">
          Confirm new password
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="mt-1 w-full rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
        />
      </div>
      {state?.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
      >
        {pending ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}
