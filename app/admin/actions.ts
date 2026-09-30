"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { isDeckDifficulty } from "@/lib/difficulty";
import { slugify } from "@/lib/tsv";
import { writeAuditLog } from "@/lib/audit-log";
import { MAX_TITLE_LENGTH } from "@/lib/input-limits";

export type FormState = { error?: string } | undefined;

export async function createDeck(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();
  const locale = await getLocale();
  const title = String(formData.get("title") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "INTERMEDIATE").trim();

  if (!title) return { error: t(locale, "admin.titleRequired") };
  if (title.length > MAX_TITLE_LENGTH) return { error: t(locale, "admin.titleTooLong") };
  if (!categoryId) return { error: t(locale, "admin.categoryRequired") };
  if (language !== "EN" && language !== "DE") {
    return { error: t(locale, "admin.languageRequired") };
  }
  if (!isDeckDifficulty(difficulty)) {
    return { error: t(locale, "admin.difficultyRequired") };
  }

  let slug = slugify(title);
  if (!slug) return { error: t(locale, "admin.slugInvalid") };

  const existing = await prisma.deck.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const deck = await prisma.deck.create({
    data: { title, slug, categoryId, language, difficulty },
  });
  await writeAuditLog(admin, {
    action: "DECK_CREATED",
    targetType: "DECK",
    targetId: deck.id,
    metadata: { title: deck.title, slug: deck.slug },
  });
  redirect(`/admin/decks/${deck.slug}`);
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
