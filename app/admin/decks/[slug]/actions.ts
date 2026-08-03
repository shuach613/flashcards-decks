"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { parseTsv, slugify } from "@/lib/tsv";

export type FormState = { error?: string; success?: string } | undefined;

export async function updateDeckMeta(
  deckId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const locale = await getLocale();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const certificateId = String(formData.get("certificateId") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();

  if (!title) return { error: t(locale, "admin.titleRequired") };
  if (!certificateId) return { error: t(locale, "admin.certificateRequired") };
  if (language !== "EN" && language !== "DE") {
    return { error: t(locale, "admin.languageRequired") };
  }

  const newSlug = slugify(slugInput || title);
  if (!newSlug) return { error: t(locale, "admin.slugInvalid") };

  const conflict = await prisma.deck.findFirst({
    where: { slug: newSlug, NOT: { id: deckId } },
  });
  if (conflict) return { error: t(locale, "admin.slugConflict") };

  const deck = await prisma.deck.update({
    where: { id: deckId },
    data: { title, description, slug: newSlug, certificateId, language },
  });
  redirect(`/admin/decks/${deck.slug}`);
}

export async function importCards(
  deckId: string,
  deckSlug: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const locale = await getLocale();
  const tsv = String(formData.get("tsv") ?? "");
  const parsed = parseTsv(tsv);
  if (parsed.length === 0) {
    return { error: t(locale, "admin.importError") };
  }

  const existingCount = await prisma.card.count({ where: { deckId } });
  await prisma.card.createMany({
    data: parsed.map((card, i) => ({
      deckId,
      front: card.front,
      back: card.back,
      order: existingCount + i,
    })),
  });

  revalidatePath(`/admin/decks/${deckSlug}`);
  return {
    success: tc(locale, "admin.importSuccess", parsed.length),
  };
}

export async function updateCard(
  cardId: string,
  deckSlug: string,
  formData: FormData
) {
  await requireAdmin();
  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  if (!front || !back) return;
  await prisma.card.update({ where: { id: cardId }, data: { front, back } });
  revalidatePath(`/admin/decks/${deckSlug}`);
}

export async function deleteCard(cardId: string, deckSlug: string) {
  await requireAdmin();
  await prisma.card.delete({ where: { id: cardId } });
  revalidatePath(`/admin/decks/${deckSlug}`);
}

export async function deleteDeck(deckId: string) {
  await requireAdmin();
  await prisma.deck.delete({ where: { id: deckId } });
  redirect("/admin");
}
