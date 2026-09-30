"use client";

import { useActionState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { importCards } from "./actions";

export function ImportForm({
  deckId,
  deckSlug,
  locale,
}: {
  deckId: string;
  deckSlug: string;
  locale: Locale;
}) {
  const action = importCards.bind(null, deckId, deckSlug);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="tsv"
        rows={6}
        placeholder={"front 1\tback 1\nfront 2\tback 2"}
        className="w-full rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 font-mono text-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
      />
      {state?.error && <p className="text-sm text-status-danger">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-brand-accent">{state.success}</p>
      )}
      <button
        disabled={pending}
        type="submit"
        className="self-start rounded-full bg-brand-primary px-5 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? t(locale, "common.importPending") : t(locale, "common.import")}
      </button>
    </form>
  );
}
