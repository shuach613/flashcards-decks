import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { serializeCard } from "@/lib/api-serialize";
import { prisma } from "@/lib/db";
import { MAX_CARD_TEXT_LENGTH } from "@/lib/input-limits";
import { writeAuditLog } from "@/lib/audit-log";

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
    if (front.length > MAX_CARD_TEXT_LENGTH) {
      return NextResponse.json({ error: "'front' is too long." }, { status: 400 });
    }
    data.front = front;
  }
  if (body.back !== undefined) {
    const back = String(body.back).trim();
    if (!back) {
      return NextResponse.json({ error: "'back' cannot be empty." }, { status: 400 });
    }
    if (back.length > MAX_CARD_TEXT_LENGTH) {
      return NextResponse.json({ error: "'back' is too long." }, { status: 400 });
    }
    data.back = back;
  }

  const updated = await prisma.card.update({ where: { id }, data });
  await writeAuditLog({ email: "Admin API" }, {
    action: "CARD_UPDATED",
    targetType: "CARD",
    targetId: updated.id,
    metadata: { via: "api" },
  });
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

  await writeAuditLog({ email: "Admin API" }, {
    action: "CARD_DELETED",
    targetType: "CARD",
    targetId: card.id,
    metadata: { via: "api" },
  });
  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ deleted: true, id });
}
