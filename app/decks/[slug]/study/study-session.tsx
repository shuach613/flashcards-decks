"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { completeSession } from "./actions";

type Card = { id: string; front: string; back: string };

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function StudySession({
  deckSlug,
  deckTitle,
  cards,
}: {
  deckSlug: string;
  deckTitle: string;
  cards: Card[];
}) {
  const total = cards.length;
  const [queue, setQueue] = useState<Card[]>(() => shuffle(cards));
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [againIds, setAgainIds] = useState<Set<string>>(new Set());
  const reported = useRef(false);

  const current = queue[0];
  const finished = queue.length === 0;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      completeSession(deckSlug);
    }
  }, [finished, deckSlug]);

  function rate(again: boolean) {
    const cardId = current.id;
    setReviewed((n) => n + 1);

    if (again) {
      setAgainIds((prev) => (prev.has(cardId) ? prev : new Set(prev).add(cardId)));
    } else {
      setDoneCount((n) => n + 1);
      setAgainIds((prev) => {
        if (!prev.has(cardId)) return prev;
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }

    setQueue((q) => {
      const [first, ...rest] = q;
      if (!again) return rest;
      const insertAt = Math.min(rest.length, 3);
      const next = [...rest];
      next.splice(insertAt, 0, first);
      return next;
    });
    setRevealed(false);
  }

  if (finished) {
    return (
      <div className="rounded-2xl border border-sand bg-white p-10 text-center shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          Session complete
        </h1>
        <p className="mt-2 text-dark-gray">
          {`You reviewed ${reviewed} card${reviewed === 1 ? "" : "s"} in "${deckTitle}".`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/decks/${deckSlug}`}
            className="rounded-full border border-evergreen/20 px-5 py-2.5 font-semibold text-evergreen transition hover:bg-evergreen/5"
          >
            Back to deck
          </Link>
          <Link
            href="/"
            className="rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
          >
            My decks
          </Link>
        </div>
      </div>
    );
  }

  const donePct = (doneCount / total) * 100;
  const againPct = (againIds.size / total) * 100;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-dark-gray">
        {queue.length} card{queue.length === 1 ? "" : "s"} left · {deckTitle}
      </p>
      <div
        className="mb-6 h-2.5 w-full overflow-hidden rounded-full bg-sand"
        role="progressbar"
        aria-valuenow={doneCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Session progress"
      >
        <div className="relative h-full w-full">
          <div
            className="absolute inset-y-0 left-0 bg-grass-green transition-[width] duration-300 ease-out"
            style={{ width: `${donePct}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-sunset-orange transition-[width] duration-300 ease-out"
            style={{ width: `${againPct}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className={`flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border p-8 text-center text-lg shadow-[0_2px_8px_rgba(25,51,37,0.08)] transition ${
          revealed ? "border-transparent bg-lime-green" : "border-sand bg-white"
        }`}
      >
        <span className="font-medium text-evergreen">{current.front}</span>
        {revealed ? (
          <>
            <hr className="my-4 w-full border-evergreen/10" />
            <span className="text-dark-gray">{current.back}</span>
          </>
        ) : (
          <span className="mt-4 text-xs tracking-wide text-dark-gray uppercase">
            Tap to reveal
          </span>
        )}
      </button>
      {revealed && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => rate(true)}
            className="rounded-full border border-sunset-orange/30 px-5 py-2.5 font-semibold text-sunset-orange transition hover:bg-sunset-orange/5"
          >
            Again
          </button>
          <button
            type="button"
            onClick={() => rate(false)}
            className="rounded-full bg-bright-green px-5 py-2.5 font-semibold text-evergreen transition hover:brightness-110"
          >
            Good
          </button>
        </div>
      )}
    </div>
  );
}
