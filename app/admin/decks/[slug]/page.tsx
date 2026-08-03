import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { ensureDefaultCertificates } from "@/lib/certificates-server";
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
  await ensureDefaultCertificates();
  const { slug } = await params;

  const [deck, certificates] = await Promise.all([
    prisma.deck.findUnique({
      where: { slug },
      include: { cards: { orderBy: { order: "asc" } } },
    }),
    prisma.certificate.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!deck) notFound();

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          {deck.title}
        </h1>
        <form action={deleteDeck.bind(null, deck.id)}>
          <button
            type="submit"
            className="rounded-full border border-sunset-orange/30 px-4 py-1.5 text-sm font-medium text-sunset-orange transition hover:bg-sunset-orange/5"
          >
            Delete deck
          </button>
        </form>
      </div>

      <section className="mb-8 rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h2 className="mb-3 font-semibold text-evergreen">Deck details</h2>
        <DeckMetaForm
          deckId={deck.id}
          title={deck.title}
          description={deck.description}
          slug={deck.slug}
          certificateId={deck.certificateId}
          language={deck.language}
          certificates={certificates}
        />
      </section>

      <section className="mb-8 rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h2 className="mb-1 font-semibold text-evergreen">Import cards (TSV)</h2>
        <p className="mb-3 text-sm text-dark-gray">
          One card per line: front, then a tab, then back.
        </p>
        <ImportForm deckId={deck.id} deckSlug={deck.slug} />
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-evergreen">
          Cards ({deck.cards.length})
        </h2>
        <ul className="flex flex-col gap-3">
          {deck.cards.map((card) => (
            <li
              key={card.id}
              className="rounded-2xl border border-sand bg-white p-4 shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
            >
              <form
                action={updateCard.bind(null, card.id, deck.slug)}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <input
                  name="front"
                  defaultValue={card.front}
                  className="flex-1 rounded-lg border border-soft-gray px-2.5 py-1.5 text-sm outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
                />
                <input
                  name="back"
                  defaultValue={card.back}
                  className="flex-1 rounded-lg border border-soft-gray px-2.5 py-1.5 text-sm outline-none transition focus:border-evergreen focus:ring-4 focus:ring-evergreen/10"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full border border-evergreen/20 px-4 py-1.5 text-sm font-medium text-evergreen transition hover:bg-evergreen/5"
                >
                  Save
                </button>
              </form>
              <form
                action={deleteCard.bind(null, card.id, deck.slug)}
                className="mt-2"
              >
                <button
                  type="submit"
                  className="text-sm font-medium text-sunset-orange"
                >
                  Delete card
                </button>
              </form>
            </li>
          ))}
          {deck.cards.length === 0 && (
            <p className="text-dark-gray">No cards yet — import some above.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
