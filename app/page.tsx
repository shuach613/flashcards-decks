import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto mt-16 max-w-xl px-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          Flashcard Decks
        </h1>
        <p className="mt-4 text-dark-gray">
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
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
        Your decks
      </h1>
      {progress.length === 0 ? (
        <p className="text-dark-gray">
          You haven&apos;t opened any decks yet. Open a deck link someone
          shared with you to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {progress.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-sand bg-white p-4 shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-evergreen">{p.deck.title}</p>
                  <p className="text-sm text-dark-gray">
                    Last studied {p.lastStudiedAt.toLocaleDateString()} ·{" "}
                    {p.timesStudied} session{p.timesStudied === 1 ? "" : "s"}
                  </p>
                </div>
                <Link
                  href={`/decks/${p.deck.slug}`}
                  className="shrink-0 rounded-full bg-evergreen px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
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
