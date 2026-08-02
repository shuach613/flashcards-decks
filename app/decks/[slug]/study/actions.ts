"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function completeSession(deckSlug: string) {
  const session = await auth();
  if (!session?.user) return;

  const deck = await prisma.deck.findUnique({ where: { slug: deckSlug } });
  if (!deck) return;

  await prisma.studyProgress.upsert({
    where: {
      userId_deckId: { userId: session.user.id, deckId: deck.id },
    },
    create: { userId: session.user.id, deckId: deck.id, timesStudied: 1 },
    update: { timesStudied: { increment: 1 }, lastStudiedAt: new Date() },
  });
}
