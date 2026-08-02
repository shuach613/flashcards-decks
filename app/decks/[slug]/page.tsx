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
      <h1 className="text-2xl font-semibold">{deck.title}</h1>
      {deck.description && (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {deck.description}
        </p>
      )}
      <p className="mt-2 text-sm text-zinc-500">
        {deck._count.cards} card{deck._count.cards === 1 ? "" : "s"}
      </p>
      {deck._count.cards === 0 ? (
        <p className="mt-6 text-zinc-500">This deck has no cards yet.</p>
      ) : (
        <Link
          href={`/decks/${deck.slug}/study`}
          className="mt-6 inline-block rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Start studying
        </Link>
      )}
    </div>
  );
}
