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
        <label className="block text-sm font-medium text-evergreen" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={title}
          required
          className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-evergreen" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={description}
          rows={2}
          className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-evergreen" htmlFor="slug">
          Slug (used in the shareable link)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={slug}
          className="mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
        />
      </div>
      {state?.error && <p className="text-sm text-sunset-orange">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="self-start rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
