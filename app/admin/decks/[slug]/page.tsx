import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { deleteCard, deleteDeck, updateCard } from "./actions";
import { DeckMetaForm } from "./deck-meta-form";
import { ImportForm } from "./import-form";

export default async function AdminDeckPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;

  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: { cards: { orderBy: { order: "asc" } } },
  });
  if (!deck) notFound();

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{deck.title}</h1>
        <form action={deleteDeck.bind(null, deck.id)}>
          <button
            type="submit"
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600"
          >
            Delete deck
          </button>
        </form>
      </div>

      <section className="mb-8 rounded border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 font-medium">Deck details</h2>
        <DeckMetaForm
          deckId={deck.id}
          title={deck.title}
          description={deck.description}
          slug={deck.slug}
        />
      </section>

      <section className="mb-8 rounded border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-1 font-medium">Import cards (TSV)</h2>
        <p className="mb-3 text-sm text-zinc-500">
          One card per line: front, then a tab, then back.
        </p>
        <ImportForm deckId={deck.id} deckSlug={deck.slug} />
      </section>

      <section>
        <h2 className="mb-3 font-medium">Cards ({deck.cards.length})</h2>
        <ul className="flex flex-col gap-3">
          {deck.cards.map((card) => (
            <li
              key={card.id}
              className="rounded border border-black/10 p-3 dark:border-white/10"
            >
              <form
                action={updateCard.bind(null, card.id, deck.slug)}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <input
                  name="front"
                  defaultValue={card.front}
                  className="flex-1 rounded border border-black/15 px-2 py-1 dark:border-white/20 dark:bg-transparent"
                />
                <input
                  name="back"
                  defaultValue={card.back}
                  className="flex-1 rounded border border-black/15 px-2 py-1 dark:border-white/20 dark:bg-transparent"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded border border-black/15 px-3 py-1 text-sm dark:border-white/20"
                >
                  Save
                </button>
              </form>
              <form
                action={deleteCard.bind(null, card.id, deck.slug)}
                className="mt-2"
              >
                <button type="submit" className="text-sm text-red-600">
                  Delete card
                </button>
              </form>
            </li>
          ))}
          {deck.cards.length === 0 && (
            <p className="text-zinc-500">No cards yet — import some above.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
