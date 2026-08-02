"use client";

import { useActionState } from "react";
import { createDeck } from "./actions";

export function CreateDeckForm() {
  const [state, formAction, pending] = useActionState(createDeck, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="e.g. Topic A"
            className="mt-1 w-full rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </div>
        <button
          disabled={pending}
          type="submit"
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Creating…" : "Create"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
