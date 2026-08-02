import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto mt-16 max-w-xl px-6 text-center">
        <h1 className="text-2xl font-semibold">Flashcard Decks</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Log in or sign up to start studying. If someone sent you a link to a
          specific deck, open that link directly.
        </p>
      </div>
    );
  }

  const progress = await prisma.studyProgress.findMany({
    where: { userId: session.user.id },
    include: { deck: true },
    orderBy: { lastStudiedAt: "desc" },
  });

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6">
      <h1 className="mb-6 text-2xl font-semibold">Your decks</h1>
      {progress.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          You haven&apos;t opened any decks yet. Open a deck link someone
          shared with you to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {progress.map((p) => (
            <li
              key={p.id}
              className="rounded border border-black/10 p-4 dark:border-white/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{p.deck.title}</p>
                  <p className="text-sm text-zinc-500">
                    Last studied {p.lastStudiedAt.toLocaleDateString()} ·{" "}
                    {p.timesStudied} session{p.timesStudied === 1 ? "" : "s"}
                  </p>
                </div>
                <Link
                  href={`/decks/${p.deck.slug}`}
                  className="shrink-0 rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
                >
                  Continue
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
