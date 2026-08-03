import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { serializeDeck } from "@/lib/api-serialize";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/tsv";

async function findDeck(slug: string) {
  return prisma.deck.findUnique({
    where: { slug },
    include: {
      certificate: true,
      cards: { orderBy: { order: "asc" } },
      _count: { select: { cards: true } },
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { slug } = await params;
  const deck = await findDeck(slug);
  if (!deck) {
    return NextResponse.json({ error: "Deck not found." }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  return NextResponse.json({ deck: serializeDeck(deck, origin) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { slug } = await params;
  const deck = await findDeck(slug);
  if (!deck) {
    return NextResponse.json({ error: "Deck not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data: {
    title?: string;
    description?: string;
    language?: string;
    slug?: string;
    certificateId?: string | null;
  } = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) {
      return NextResponse.json({ error: "'title' cannot be empty." }, { status: 400 });
    }
    data.title = title;
  }

  if (body.description !== undefined) {
    data.description = String(body.description).trim();
  }

  if (body.language !== undefined) {
    const language = String(body.language).trim();
    if (language !== "EN" && language !== "DE") {
      return NextResponse.json(
        { error: "'language' must be 'EN' or 'DE'." },
        { status: 400 }
      );
    }
    data.language = language;
  }

  if (body.certificate !== undefined) {
    const certificateName = String(body.certificate).trim();
    if (!certificateName) {
      data.certificateId = null;
    } else {
      const certificate = await prisma.certificate.findUnique({
        where: { name: certificateName },
      });
      if (!certificate) {
        const available = await prisma.certificate.findMany({
          select: { name: true },
          orderBy: { order: "asc" },
        });
        return NextResponse.json(
          {
            error: `Certificate '${certificateName}' not found.`,
            availableCertificates: available.map((c) => c.name),
          },
          { status: 400 }
        );
      }
      data.certificateId = certificate.id;
    }
  }

  if (body.slug !== undefined) {
    const newSlug = slugify(String(body.slug));
    if (!newSlug) {
      return NextResponse.json(
        { error: "'slug' must contain letters or numbers." },
        { status: 400 }
      );
    }
    if (newSlug !== deck.slug) {
      const conflict = await prisma.deck.findUnique({ where: { slug: newSlug } });
      if (conflict) {
        return NextResponse.json(
          { error: `Slug '${newSlug}' is already in use.` },
          { status: 409 }
        );
      }
    }
    data.slug = newSlug;
  }

  const updated = await prisma.deck.update({
    where: { id: deck.id },
    data,
    include: {
      certificate: true,
      cards: { orderBy: { order: "asc" } },
      _count: { select: { cards: true } },
    },
  });

  const origin = new URL(request.url).origin;
  return NextResponse.json({ deck: serializeDeck(updated, origin) });
}

export async function DELETE(
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

  await prisma.deck.delete({ where: { id: deck.id } });
  return NextResponse.json({ deleted: true, slug });
}
