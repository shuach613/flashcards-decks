import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { serializeDeck } from "@/lib/api-serialize";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/tsv";

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const decks = await prisma.deck.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, _count: { select: { cards: true } } },
  });

  const origin = new URL(request.url).origin;
  return NextResponse.json({
    decks: decks.map((deck) => serializeDeck(deck, origin)),
  });
}

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const categoryName = String(body.category ?? "").trim();
  const language = String(body.language ?? "").trim();
  const description = String(body.description ?? "").trim();
  const slugInput = String(body.slug ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "'title' is required." }, { status: 400 });
  }
  if (language !== "EN" && language !== "DE") {
    return NextResponse.json(
      { error: "'language' must be 'EN' or 'DE'." },
      { status: 400 }
    );
  }

  let categoryId: string | null = null;
  if (categoryName) {
    const category = await prisma.category.findUnique({
      where: { name: categoryName },
    });
    if (!category) {
      const available = await prisma.category.findMany({
        select: { name: true },
        orderBy: { order: "asc" },
      });
      return NextResponse.json(
        {
          error: `Category '${categoryName}' not found.`,
          availableCategories: available.map((c) => c.name),
        },
        { status: 400 }
      );
    }
    categoryId = category.id;
  }

  let slug = slugify(slugInput || title);
  if (!slug) {
    return NextResponse.json(
      { error: "Could not derive a slug — 'title' or 'slug' must contain letters or numbers." },
      { status: 400 }
    );
  }
  const existing = await prisma.deck.findUnique({ where: { slug } });
  if (existing) {
    if (slugInput) {
      return NextResponse.json(
        { error: `Slug '${slug}' is already in use.` },
        { status: 409 }
      );
    }
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const deck = await prisma.deck.create({
    data: { title, description, slug, categoryId, language },
    include: { category: true, _count: { select: { cards: true } } },
  });

  const origin = new URL(request.url).origin;
  return NextResponse.json({ deck: serializeDeck(deck, origin) }, { status: 201 });
}
