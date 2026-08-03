import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { serializeCard } from "@/lib/api-serialize";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data: { front?: string; back?: string } = {};
  if (body.front !== undefined) {
    const front = String(body.front).trim();
    if (!front) {
      return NextResponse.json({ error: "'front' cannot be empty." }, { status: 400 });
    }
    data.front = front;
  }
  if (body.back !== undefined) {
    const back = String(body.back).trim();
    if (!back) {
      return NextResponse.json({ error: "'back' cannot be empty." }, { status: 400 });
    }
    data.back = back;
  }

  const updated = await prisma.card.update({ where: { id }, data });
  return NextResponse.json({ card: serializeCard(updated) });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ deleted: true, id });
}
