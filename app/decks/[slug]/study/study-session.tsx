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
  const [queue, setQueue] = useState<Card[]>(() => shuffle(cards));
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
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
    setReviewed((n) => n + 1);
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
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Session complete</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {`You reviewed ${reviewed} card${reviewed === 1 ? "" : "s"} in "${deckTitle}".`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/decks/${deckSlug}`}
            className="rounded border border-black/15 px-4 py-2 dark:border-white/20"
          >
            Back to deck
          </Link>
          <Link
            href="/"
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            My decks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-zinc-500">
        {queue.length} card{queue.length === 1 ? "" : "s"} left · {deckTitle}
      </p>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="flex min-h-48 w-full flex-col items-center justify-center rounded-lg border border-black/15 p-8 text-center text-lg dark:border-white/20"
      >
        <span>{current.front}</span>
        {revealed ? (
          <>
            <hr className="my-4 w-full border-black/10 dark:border-white/10" />
            <span className="text-zinc-600 dark:text-zinc-400">
              {current.back}
            </span>
          </>
        ) : (
          <span className="mt-4 text-xs text-zinc-400">Tap to reveal</span>
        )}
      </button>
      {revealed && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => rate(true)}
            className="rounded border border-red-300 px-4 py-2 text-red-600"
          >
            Again
          </button>
          <button
            type="button"
            onClick={() => rate(false)}
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Good
          </button>
        </div>
      )}
    </div>
  );
}
