import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { serializeCard } from "@/lib/api-serialize";
import { prisma } from "@/lib/db";
import { parseTsv } from "@/lib/tsv";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { slug } = await params;
  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: { cards: { orderBy: { order: "asc" } } },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck not found." }, { status: 404 });
  }

  return NextResponse.json({ cards: deck.cards.map(serializeCard) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { slug } = await params;
  const deck = await prisma.deck.findUnique({ where: { slug } });
  if (!deck) {
    return NextResponse.json({ error: "Deck not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let cards: { front: string; back: string }[] = [];

  if (typeof body.tsv === "string") {
    cards = parseTsv(body.tsv);
  } else if (Array.isArray(body.cards)) {
    cards = body.cards
      .map((c: unknown) => {
        if (!c || typeof c !== "object") return null;
        const front = String((c as Record<string, unknown>).front ?? "").trim();
        const back = String((c as Record<string, unknown>).back ?? "").trim();
        return front && back ? { front, back } : null;
      })
      .filter((c: { front: string; back: string } | null): c is { front: string; back: string } => c !== null);
  }

  if (cards.length === 0) {
    return NextResponse.json(
      {
        error:
          "No valid cards found. Provide either 'tsv' (front<TAB>back per line) or 'cards' (array of {front, back}).",
      },
      { status: 400 }
    );
  }

  const existingCount = await prisma.card.count({ where: { deckId: deck.id } });
  await prisma.card.createMany({
    data: cards.map((card, i) => ({
      deckId: deck.id,
      front: card.front,
      back: card.back,
      order: existingCount + i,
    })),
  });

  const created = await prisma.card.findMany({
    where: { deckId: deck.id },
    orderBy: { order: "asc" },
    take: cards.length,
    skip: existingCount,
  });

  return NextResponse.json(
    { added: created.length, cards: created.map(serializeCard) },
    { status: 201 }
  );
}
