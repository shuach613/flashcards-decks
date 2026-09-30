"use client";

import { useActionState } from "react";
import { DeckDifficultyIndicator } from "@/components/deck-difficulty";
import { t, type Locale } from "@/lib/i18n";
import { changeEmail, deleteAccount, resetDeckProgress, type SettingsState } from "./actions";
import { requestVerificationEmail, type VerificationState } from "./verification-actions";

type Deck = { id: string; title: string; difficulty: string };

export function ChangeEmailForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    changeEmail,
    undefined
  );

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <label className="text-sm font-medium text-brand-primary" htmlFor="new-email">
        {t(locale, "settings.changeEmail")}
      </label>
      <input
        id="new-email"
        name="email"
        type="email"
        required
        className="w-full rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
      />
      <label className="text-sm font-medium text-brand-primary" htmlFor="current-password">
        {t(locale, "auth.passwordLabel")}
      </label>
      <input
        id="current-password"
        name="password"
        type="password"
        required
        className="w-full rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
      />
      {state?.error && <p className="text-sm text-status-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        onClick={(event) => {
          const form = event.currentTarget.form;
          const email = form?.elements.namedItem("email") as HTMLInputElement | null;
          if (email && !window.confirm(t(locale, "settings.changeEmailConfirm", { email: email.value }))) {
            event.preventDefault();
          }
        }}
        className="self-start rounded-full bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending ? t(locale, "common.savePending") : t(locale, "common.save")}
      </button>
    </form>
  );
}

export function ResendVerificationForm({ locale }: { locale: Locale }) {
  const [state, formAction, pending] = useActionState<VerificationState, FormData>(
    requestVerificationEmail,
    undefined
  );

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-3">
      {state?.error && <p className="text-sm text-status-danger">{state.error}</p>}
      {state?.message && <p className="text-sm text-brand-accent">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {pending
          ? t(locale, "settings.resendVerificationPending")
          : t(locale, "settings.resendVerification")}
      </button>
    </form>
  );
}

export function ResetProgressList({ decks, locale }: { decks: Deck[]; locale: Locale }) {
  return decks.length === 0 ? (
    <p className="mt-4 text-sm text-text-muted">{t(locale, "settings.noDecks")}</p>
  ) : (
    <ul className="mt-4 flex flex-col gap-2">
      {decks.map((deck) => (
        <li key={deck.id} className="flex items-center justify-between gap-4 rounded-xl bg-cream px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium text-brand-primary">{deck.title}</span>
            <DeckDifficultyIndicator difficulty={deck.difficulty} locale={locale} />
          </div>
          <form
            action={resetDeckProgress.bind(null, deck.id)}
            onSubmit={(event) => {
              if (!window.confirm(t(locale, "settings.resetConfirm", { title: deck.title }))) {
                event.preventDefault();
                return;
              }
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = "confirmed";
              input.value = "yes";
              event.currentTarget.appendChild(input);
            }}
          >
            <button type="submit" className="rounded-full border border-brand-primary/20 px-3 py-1.5 text-sm font-semibold text-brand-primary hover:bg-brand-primary/5">
              {t(locale, "settings.resetProgress")}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export function DeleteAccountForm({ locale }: { locale: Locale }) {
  return (
    <form
      action={deleteAccount}
      className="mt-4 flex flex-col gap-3"
      onSubmit={(event) => {
        if (!window.confirm(t(locale, "settings.deleteConfirm"))) {
          event.preventDefault();
          return;
        }
        const password = event.currentTarget.elements.namedItem("password") as HTMLInputElement | null;
        if (!password?.value) {
          event.preventDefault();
          password?.focus();
          return;
        }
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "confirmed";
        input.value = "yes";
        event.currentTarget.appendChild(input);
      }}
    >
      <label className="text-sm font-medium text-brand-primary" htmlFor="delete-password">
        {t(locale, "settings.deletePassword")}
      </label>
      <input
        id="delete-password"
        name="password"
        type="password"
        required
        className="w-full rounded-xl border border-neutral-muted bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-status-danger focus:ring-4 focus:ring-status-danger/10"
      />
      <button type="submit" className="self-start rounded-full border border-status-danger/30 px-4 py-1.5 text-sm font-semibold text-status-danger hover:bg-status-danger/5">
        {t(locale, "settings.deleteAccount")}
      </button>
    </form>
  );
}
