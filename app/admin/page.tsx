import Link from "next/link";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { CreateDeckForm } from "./create-deck-form";
import { deleteDeck } from "./actions";

export default async function AdminPage() {
  await requireAdmin();

  const decks = await prisma.deck.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cards: true } } },
  });

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
      <h1 className="mb-6 text-2xl font-semibold">Admin · Decks</h1>

      <div className="mb-8 rounded border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 font-medium">New deck</h2>
        <CreateDeckForm />
      </div>

      <ul className="flex flex-col gap-3">
        {decks.map((deck) => (
          <li
            key={deck.id}
            className="flex items-center justify-between gap-4 rounded border border-black/10 p-4 dark:border-white/10"
          >
            <div>
              <p className="font-medium">{deck.title}</p>
              <p className="text-sm text-zinc-500">
                /decks/{deck.slug} · {deck._count.cards} card
                {deck._count.cards === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/admin/decks/${deck.slug}`}
                className="rounded border border-black/15 px-3 py-1.5 text-sm dark:border-white/20"
              >
                Edit
              </Link>
              <form action={deleteDeck.bind(null, deck.id)}>
                <button
                  type="submit"
                  className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600"
                >
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
        {decks.length === 0 && <p className="text-zinc-500">No decks yet.</p>}
      </ul>
    </div>
  );
}
