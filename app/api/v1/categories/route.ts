import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { ensureDefaultCategories } from "@/lib/categories-server";
import { serializeCategory } from "@/lib/api-serialize";
import { prisma } from "@/lib/db";
import { MAX_TITLE_LENGTH } from "@/lib/input-limits";
import { writeAuditLog } from "@/lib/audit-log";

export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  await ensureDefaultCategories();
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { decks: true } } },
  });

  return NextResponse.json({
    categories: categories.map(serializeCategory),
  });
}

export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "'name' is required." }, { status: 400 });
  }
  if (name.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Category name is too long." }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json(
      { error: `A category named '${name}' already exists.` },
      { status: 409 }
    );
  }

  const last = await prisma.category.findFirst({ orderBy: { order: "desc" } });
  const category = await prisma.category.create({
    data: { name, order: (last?.order ?? -1) + 1 },
    include: { _count: { select: { decks: true } } },
  });
  await writeAuditLog({ email: "Admin API" }, {
    action: "CATEGORY_CREATED",
    targetType: "CATEGORY",
    targetId: category.id,
    metadata: { name: category.name, via: "api" },
  });

  return NextResponse.json(
    { category: serializeCategory(category) },
    { status: 201 }
  );
}
