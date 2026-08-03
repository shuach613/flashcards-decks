"use client";

import { useActionState } from "react";
import { LANGUAGES } from "@/lib/certificates";
import { updateDeckMeta } from "./actions";

type Certificate = { id: string; name: string };

export function DeckMetaForm({
  deckId,
  title,
  description,
  slug,
  certificateId,
  language,
  certificates,
}: {
  deckId: string;
  title: string;
  description: string;
  slug: string;
  certificateId: string | null;
  language: string;
  certificates: Certificate[];
}) {
  const action = updateDeckMeta.bind(null, deckId);
  const [state, formAction, pending] = useActionState(action, undefined);

  const fieldClass =
    "mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10";

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
          className={fieldClass}
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
          className={fieldClass}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label
            className="block text-sm font-medium text-evergreen"
            htmlFor="certificateId"
          >
            Certificate
          </label>
          <select
            id="certificateId"
            name="certificateId"
            required
            defaultValue={certificateId ?? ""}
            className={fieldClass}
          >
            <option value="" disabled>
              Select…
            </option>
            {certificates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-evergreen" htmlFor="language">
            Language
          </label>
          <select
            id="language"
            name="language"
            required
            defaultValue={language}
            className={fieldClass}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-evergreen" htmlFor="slug">
          Slug (used in the shareable link)
        </label>
        <input id="slug" name="slug" defaultValue={slug} className={fieldClass} />
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
