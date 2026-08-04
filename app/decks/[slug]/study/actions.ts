"use server";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export type Rating = "GOOD" | "AGAIN";

export async function rateCard(
  deckSlug: string,
  cardId: string,
  rating: Rating
) {
  const user = await requireUser();
  if (rating !== "GOOD" && rating !== "AGAIN") {
    return { error: "Invalid rating." } as const;
  }

  const card = await prisma.card.findFirst({
    where: { id: cardId, deck: { slug: deckSlug } },
    select: { id: true, deckId: true },
  });
  if (!card) return { error: "Card not found." } as const;

  return prisma.$transaction(async (tx) => {
    const previous = await tx.cardProgress.findUnique({
      where: { userId_cardId: { userId: user.id, cardId } },
      select: { isGood: true },
    });

    await tx.cardProgress.upsert({
      where: { userId_cardId: { userId: user.id, cardId } },
      create: {
        userId: user.id,
        cardId,
        isGood: rating === "GOOD",
        timesGood: rating === "GOOD" ? 1 : 0,
        timesAgain: rating === "AGAIN" ? 1 : 0,
      },
      update: {
        isGood: rating === "GOOD",
        ...(rating === "GOOD"
          ? { timesGood: { increment: 1 } }
          : { timesAgain: { increment: 1 } }),
      },
    });

    const [totalCount, goodCount] = await Promise.all([
      tx.card.count({ where: { deckId: card.deckId } }),
      tx.cardProgress.count({
        where: {
          userId: user.id,
          isGood: true,
          card: { deckId: card.deckId },
        },
      }),
    ]);
    const completedNow =
      rating === "GOOD" &&
      previous?.isGood !== true &&
      totalCount > 0 &&
      goodCount === totalCount;

    await tx.studyProgress.upsert({
      where: { userId_deckId: { userId: user.id, deckId: card.deckId } },
      create: {
        userId: user.id,
        deckId: card.deckId,
        timesStudied: completedNow ? 1 : 0,
      },
      update: {
        lastStudiedAt: new Date(),
        ...(completedNow ? { timesStudied: { increment: 1 } } : {}),
      },
    });

    return {
      goodCount,
      totalCount,
      isComplete: totalCount > 0 && goodCount === totalCount,
    } as const;
  });
}

async function resetDeck(userId: string, deckSlug: string) {
  const deck = await prisma.deck.findUnique({
    where: { slug: deckSlug },
    select: { id: true },
  });
  if (!deck) return { error: "Deck not found." } as const;

  await prisma.$transaction([
    prisma.cardProgress.updateMany({
      where: { userId, card: { deckId: deck.id } },
      data: { isGood: false },
    }),
    prisma.studyProgress.upsert({
      where: { userId_deckId: { userId, deckId: deck.id } },
      create: { userId, deckId: deck.id },
      update: { lastStudiedAt: new Date() },
    }),
  ]);

  return { restarted: true } as const;
}

export async function restartDeck(deckSlug: string) {
  const user = await requireUser();
  return resetDeck(user.id, deckSlug);
}

export async function restartDeckAndStudy(deckSlug: string) {
  const user = await requireUser();
  const result = await resetDeck(user.id, deckSlug);
  if ("error" in result) throw new Error(result.error);
  redirect(`/decks/${deckSlug}/study`);
}
