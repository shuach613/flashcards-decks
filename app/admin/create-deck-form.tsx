"use client";

import { useActionState } from "react";
import { createDeck } from "./actions";

export function CreateDeckForm() {
  const [state, formAction, pending] = useActionState(createDeck, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-evergreen" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="e.g. Topic A"
            className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
          />
        </div>
        <button
          disabled={pending}
          type="submit"
          className="rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-sunset-orange">{state.error}</p>}
    </form>
  );
}
