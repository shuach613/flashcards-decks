"use client";

import { useActionState } from "react";
import { signup } from "./actions";

export function SignupForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <label className="block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
        <p className="mt-1 text-xs text-zinc-500">At least 8 characters.</p>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Signing up…" : "Sign up"}
      </button>
    </form>
  );
}
