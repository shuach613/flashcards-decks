"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "./actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-brand-primary" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
        />
      </div>
      {state?.error && <p className="text-sm text-status-danger">{state.error}</p>}
      {state?.message && <p className="text-sm text-brand-accent">{state.message}</p>}
      <button
        disabled={pending}
        type="submit"
        className="rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send reset link"}
      </button>
      <Link
        className="text-center text-sm font-medium text-brand-primary underline underline-offset-4"
        href="/login"
      >
        Back to login
      </Link>
    </form>
  );
}
