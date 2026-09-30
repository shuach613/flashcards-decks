"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { isDeckDifficulty } from "@/lib/difficulty";
import { parseTsv, slugify } from "@/lib/tsv";
import { writeAuditLog } from "@/lib/audit-log";
import { MAX_CARD_TEXT_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_IMPORT_BYTES, MAX_IMPORT_CARDS, MAX_TITLE_LENGTH } from "@/lib/input-limits";

export type FormState = { error?: string; success?: string } | undefined;

export async function updateDeckMeta(
  deckId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  const locale = await getLocale();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "").trim();

  if (!title) return { error: t(locale, "admin.titleRequired") };
  if (title.length > MAX_TITLE_LENGTH || description.length > MAX_DESCRIPTION_LENGTH) return { error: t(locale, "admin.inputTooLong") };
  if (!categoryId) return { error: t(locale, "admin.categoryRequired") };
  if (language !== "EN" && language !== "DE") {
    return { error: t(locale, "admin.languageRequired") };
  }
  if (!isDeckDifficulty(difficulty)) {
    return { error: t(locale, "admin.difficultyRequired") };
  }

  const newSlug = slugify(slugInput || title);
  if (!newSlug) return { error: t(locale, "admin.slugInvalid") };

  const conflict = await prisma.deck.findFirst({
    where: { slug: newSlug, NOT: { id: deckId } },
  });
  if (conflict) return { error: t(locale, "admin.slugConflict") };

  const deck = await prisma.deck.update({
    where: { id: deckId },
    data: {
      title,
      description,
      slug: newSlug,
      categoryId,
      language,
      difficulty,
    },
  });
  await writeAuditLog(admin, {
    action: "DECK_UPDATED",
    targetType: "DECK",
    targetId: deck.id,
    metadata: { title: deck.title, slug: deck.slug, difficulty: deck.difficulty },
  });
  redirect(`/admin/decks/${deck.slug}`);
}

export async function importCards(
  deckId: string,
  deckSlug: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  const locale = await getLocale();
  const tsv = String(formData.get("tsv") ?? "");
  if (tsv.length > MAX_IMPORT_BYTES) return { error: t(locale, "admin.importTooLarge") };
  const parsed = parseTsv(tsv);
  if (parsed.length === 0) {
    return { error: t(locale, "admin.importError") };
  }
  if (parsed.length > MAX_IMPORT_CARDS || parsed.some((card) => card.front.length > MAX_CARD_TEXT_LENGTH || card.back.length > MAX_CARD_TEXT_LENGTH)) {
    return { error: t(locale, "admin.importTooLarge") };
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

  await writeAuditLog(admin, {
    action: "CARDS_IMPORTED",
    targetType: "DECK",
    targetId: deckId,
    metadata: { deckSlug, count: parsed.length },
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
  const admin = await requireAdmin();
  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  if (!front || !back || front.length > MAX_CARD_TEXT_LENGTH || back.length > MAX_CARD_TEXT_LENGTH) return;
  await prisma.card.update({ where: { id: cardId }, data: { front, back } });
  await writeAuditLog(admin, {
    action: "CARD_UPDATED",
    targetType: "CARD",
    targetId: cardId,
    metadata: { deckSlug },
  });
  revalidatePath(`/admin/decks/${deckSlug}`);
}

export async function deleteCard(cardId: string, deckSlug: string) {
  const admin = await requireAdmin();
  const card = await prisma.card.findUnique({ where: { id: cardId }, select: { id: true, deckId: true } });
  if (!card) return;
  await writeAuditLog(admin, {
    action: "CARD_DELETED",
    targetType: "CARD",
    targetId: card.id,
    metadata: { deckSlug },
  });
  await prisma.card.delete({ where: { id: cardId } });
  revalidatePath(`/admin/decks/${deckSlug}`);
}

export async function deleteDeck(deckId: string) {
  const admin = await requireAdmin();
  const deck = await prisma.deck.findUnique({ where: { id: deckId }, select: { id: true, title: true, slug: true } });
  if (!deck) return;
  await writeAuditLog(admin, {
    action: "DECK_DELETED",
    targetType: "DECK",
    targetId: deck.id,
    metadata: { title: deck.title, slug: deck.slug },
  });
  await prisma.deck.delete({ where: { id: deck.id } });
  redirect("/admin");
}
