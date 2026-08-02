"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/tsv";

export type FormState = { error?: string } | undefined;

export async function createDeck(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  let slug = slugify(title);
  if (!slug) return { error: "Title must contain letters or numbers." };

  const existing = await prisma.deck.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const deck = await prisma.deck.create({ data: { title, slug } });
  redirect(`/admin/decks/${deck.slug}`);
}

export async function deleteDeck(deckId: string) {
  await requireAdmin();
  await prisma.deck.delete({ where: { id: deckId } });
  redirect("/admin");
}
