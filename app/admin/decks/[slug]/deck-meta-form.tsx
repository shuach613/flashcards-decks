"use client";

import { useActionState } from "react";
import { updateDeckMeta } from "./actions";

export function DeckMetaForm({
  deckId,
  title,
  description,
  slug,
}: {
  deckId: string;
  title: string;
  description: string;
  slug: string;
}) {
  const action = updateDeckMeta.bind(null, deckId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={title}
          required
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={description}
          rows={2}
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="slug">
          Slug (used in the shareable link)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={slug}
          className="mt-1 w-full rounded border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="self-start rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
