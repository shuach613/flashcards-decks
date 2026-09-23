"use client";

import { useActionState } from "react";
import { LANGUAGE_VALUES } from "@/lib/categories";
import { DECK_DIFFICULTIES } from "@/lib/difficulty";
import { t, type Locale } from "@/lib/i18n";
import { updateDeckMeta } from "./actions";

type Category = { id: string; name: string };

export function DeckMetaForm({
  deckId,
  title,
  description,
  slug,
  categoryId,
  language,
  difficulty,
  categories,
  locale,
}: {
  deckId: string;
  title: string;
  description: string;
  slug: string;
  categoryId: string | null;
  language: string;
  difficulty: string;
  categories: Category[];
  locale: Locale;
}) {
  const action = updateDeckMeta.bind(null, deckId);
  const [state, formAction, pending] = useActionState(action, undefined);

  const fieldClass =
    "mt-1 w-full rounded-xl border border-soft-gray bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium text-evergreen" htmlFor="title">
          {t(locale, "common.titleLabel")}
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
          {t(locale, "common.descriptionLabel")}
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
            htmlFor="categoryId"
          >
            {t(locale, "common.categoryLabel")}
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={categoryId ?? ""}
            className={fieldClass}
          >
            <option value="" disabled>
              {t(locale, "common.selectPlaceholder")}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-evergreen" htmlFor="language">
            {t(locale, "common.languageLabel")}
          </label>
          <select
            id="language"
            name="language"
            required
            defaultValue={language}
            className={fieldClass}
          >
            {LANGUAGE_VALUES.map((value) => (
              <option key={value} value={value}>
                {t(locale, `language.${value}` as "language.EN" | "language.DE")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-evergreen" htmlFor="difficulty">
            {t(locale, "common.difficultyLabel")}
          </label>
          <select
            id="difficulty"
            name="difficulty"
            required
            defaultValue={difficulty}
            className={fieldClass}
          >
            {DECK_DIFFICULTIES.map((value) => (
              <option key={value} value={value}>
                {t(locale, `deck.difficulty.${value}` as const)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-evergreen" htmlFor="slug">
          {t(locale, "common.slugLabel")}
        </label>
        <input id="slug" name="slug" defaultValue={slug} className={fieldClass} />
      </div>
      {state?.error && <p className="text-sm text-sunset-orange">{state.error}</p>}
      <button
        disabled={pending}
        type="submit"
        className="self-start rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? t(locale, "common.savePending") : t(locale, "common.save")}
      </button>
    </form>
  );
}
