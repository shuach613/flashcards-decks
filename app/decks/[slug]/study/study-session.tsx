"use client";

import { useState } from "react";
import Link from "next/link";
import { t, tc, type Locale } from "@/lib/i18n";
import { buildStudyQueue, type StudyQueueCard } from "@/lib/study-queue";
import { StudyReviewToggle } from "@/components/study-review-toggle";
import { rateCard, restartDeck, type Rating } from "./actions";

type Card = StudyQueueCard & {
  id: string;
  front: string;
  back: string;
  isGood: boolean;
  previouslyGood: boolean;
};

export function StudySession({
  deckSlug,
  deckTitle,
  cards,
  locale,
}: {
  deckSlug: string;
  deckTitle: string;
  cards: Card[];
  locale: Locale;
}) {
  const total = cards.length;
  const [cardStates, setCardStates] = useState<Card[]>(cards);
  const [includeGood, setIncludeGood] = useState(false);
  const [queue, setQueue] = useState<Card[]>(() => buildStudyQueue(cards, false));
  const [goodCount, setGoodCount] = useState(
    () => cards.filter((card) => card.isGood).length
  );
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [againIds, setAgainIds] = useState<Set<string>>(new Set());
  const [knownGoodIds, setKnownGoodIds] = useState<Set<string>>(
    () =>
      new Set(
        cards
          .filter((card) => card.previouslyGood || card.isGood)
          .map((card) => card.id)
      )
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const current = queue[0];
  const finished = queue.length === 0;

  async function rate(rating: Rating) {
    if (!current || pending) return;
    setPending(true);
    setError(undefined);

    try {
      const result = await rateCard(deckSlug, current.id, rating);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      setGoodCount(result.goodCount);
      setReviewed((count) => count + 1);
      setCardStates((previous) =>
        previous.map((card) =>
          card.id === current.id
            ? { ...card, isGood: rating === "GOOD" }
            : card
        )
      );
      setQueue((currentQueue) => {
        const [first, ...rest] = currentQueue;
        if (rating === "GOOD") return rest;

        const next = [...rest];
        next.splice(Math.min(rest.length, 3), 0, first);
        return next;
      });
      setAgainIds((previous) => {
        const next = new Set(previous);
        if (rating === "AGAIN") next.add(current.id);
        else next.delete(current.id);
        return next;
      });
      if (rating === "GOOD") {
        setKnownGoodIds((previous) => new Set(previous).add(current.id));
      }
      setRevealed(false);
    } catch {
      setError(t(locale, "study.saveFailed"));
    } finally {
      setPending(false);
    }
  }

  async function restart() {
    if (pending) return;
    setPending(true);
    setError(undefined);

    try {
      const result = await restartDeck(deckSlug);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      const resetCards = cards.map((card) => ({
        ...card,
        isGood: false,
        previouslyGood: knownGoodIds.has(card.id),
      }));
      setCardStates(resetCards);
      setQueue(buildStudyQueue(resetCards, includeGood));
      setGoodCount(0);
      setReviewed(0);
      setAgainIds(new Set());
      setRevealed(false);
    } catch {
      setError(t(locale, "study.saveFailed"));
    } finally {
      setPending(false);
    }
  }

  if (finished) {
    return (
      <div className="rounded-2xl border border-sand bg-white p-10 text-center shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-bright-green text-2xl text-evergreen">
          ✓
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          {t(locale, "study.sessionComplete")}
        </h1>
        <p className="mt-2 text-dark-gray">
          {reviewed > 0
            ? tc(locale, "study.reviewed", reviewed, { title: deckTitle })
            : t(locale, "study.alreadyComplete", { title: deckTitle })}
        </p>
        {error && <p className="mt-3 text-sm text-sunset-orange">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={restart}
            disabled={pending}
            className="rounded-full border border-evergreen/20 px-5 py-2.5 font-semibold text-evergreen transition hover:bg-evergreen/5 disabled:opacity-50"
          >
            {pending ? t(locale, "study.restarting") : t(locale, "study.studyAgain")}
          </button>
          <Link
            href={`/decks/${deckSlug}`}
            className="rounded-full border border-evergreen/20 px-5 py-2.5 font-semibold text-evergreen transition hover:bg-evergreen/5"
          >
            {t(locale, "study.backToDeck")}
          </Link>
          <Link
            href="/"
            className="rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
          >
            {t(locale, "study.myDecks")}
          </Link>
        </div>
      </div>
    );
  }

  const goodPct = (goodCount / total) * 100;
  const againPct = (againIds.size / total) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm font-medium text-dark-gray">
        <p>{tc(locale, "study.cardsLeft", queue.length, { title: deckTitle })}</p>
        <p>{t(locale, "study.progress", { good: goodCount, total })}</p>
      </div>
      <div
        className="mb-6 h-2.5 w-full overflow-hidden rounded-full bg-sand"
        role="progressbar"
        aria-valuenow={goodCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={t(locale, "study.progressLabel")}
      >
        <div className="relative h-full w-full">
          <div
            className="absolute inset-y-0 left-0 bg-grass-green transition-[width] duration-300 ease-out"
            style={{ width: `${goodPct}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-sunset-orange transition-[width] duration-300 ease-out"
            style={{ width: `${againPct}%` }}
          />
        </div>
      </div>
      <StudyReviewToggle
        checked={includeGood}
        disabled={pending}
        locale={locale}
        onChange={(nextValue) => {
          setIncludeGood(nextValue);
          setQueue(buildStudyQueue(cardStates, nextValue));
          setRevealed(false);
        }}
      />
      <button
        type="button"
        onClick={() => setRevealed((value) => !value)}
        disabled={pending}
        className={`flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border p-8 text-center text-lg shadow-[0_2px_8px_rgba(25,51,37,0.08)] transition disabled:opacity-70 ${
          revealed
            ? "border-transparent bg-lime-green"
            : current.previouslyGood
              ? "border-grass-green bg-grass-green/5"
              : "border-sand bg-white"
        }`}
      >
        {current.previouslyGood && (
          <span className="mb-4 rounded-full bg-bright-green px-3 py-1 text-xs font-semibold text-evergreen">
            ✓ {t(locale, "study.previouslyGood")}
          </span>
        )}
        <span className="font-medium text-evergreen">{current.front}</span>
        {revealed ? (
          <>
            <hr className="my-4 w-full border-evergreen/10" />
            <span className="text-dark-gray">{current.back}</span>
          </>
        ) : (
          <span className="mt-4 text-xs tracking-wide text-dark-gray uppercase">
            {t(locale, "study.tapToReveal")}
          </span>
        )}
      </button>
      {error && <p className="mt-3 text-center text-sm text-sunset-orange">{error}</p>}
      {revealed && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => rate("AGAIN")}
            disabled={pending}
            className="rounded-full border border-sunset-orange/30 px-5 py-2.5 font-semibold text-sunset-orange transition hover:bg-sunset-orange/5 disabled:opacity-50"
          >
            {pending ? t(locale, "study.saving") : t(locale, "study.again")}
          </button>
          <button
            type="button"
            onClick={() => rate("GOOD")}
            disabled={pending}
            className="rounded-full bg-bright-green px-5 py-2.5 font-semibold text-evergreen transition hover:brightness-110 disabled:opacity-50"
          >
            {pending ? t(locale, "study.saving") : t(locale, "study.good")}
          </button>
        </div>
      )}
    </div>
  );
}
