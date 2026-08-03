import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/decks/${slug}`)}`);
  }

  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: { _count: { select: { cards: true } } },
  });
  if (!deck) notFound();

  await prisma.studyProgress.upsert({
    where: { userId_deckId: { userId: session.user.id, deckId: deck.id } },
    create: { userId: session.user.id, deckId: deck.id },
    update: {},
  });

  return (
    <div className="mx-auto mt-12 max-w-xl px-6">
      <div className="rounded-2xl border border-sand bg-white p-8 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          {deck.title}
        </h1>
        {deck.description && (
          <p className="mt-2 text-dark-gray">{deck.description}</p>
        )}
        <p className="mt-2 text-sm text-dark-gray">
          {deck._count.cards} card{deck._count.cards === 1 ? "" : "s"}
        </p>
        {deck._count.cards === 0 ? (
          <p className="mt-6 text-dark-gray">This deck has no cards yet.</p>
        ) : (
          <Link
            href={`/decks/${deck.slug}/study`}
            className="mt-6 inline-block rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white transition hover:brightness-110"
          >
            Start studying
          </Link>
        )}
      </div>
    </div>
  );
}
