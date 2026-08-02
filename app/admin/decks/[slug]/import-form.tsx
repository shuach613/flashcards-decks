"use client";

import { useActionState } from "react";
import { importCards } from "./actions";

export function ImportForm({
  deckId,
  deckSlug,
}: {
  deckId: string;
  deckSlug: string;
}) {
  const action = importCards.bind(null, deckId, deckSlug);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="tsv"
        rows={6}
        placeholder={"front 1\tback 1\nfront 2\tback 2"}
        className="w-full rounded border border-black/15 px-3 py-2 font-mono text-sm dark:border-white/20 dark:bg-transparent"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">{state.success}</p>
      )}
      <button
        disabled={pending}
        type="submit"
        className="self-start rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Importing…" : "Import"}
      </button>
    </form>
  );
}
