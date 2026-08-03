"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/tsv";

export type FormState = { error?: string } | undefined;

export async function createDeck(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const locale = await getLocale();
  const title = String(formData.get("title") ?? "").trim();
  const certificateId = String(formData.get("certificateId") ?? "").trim();
  const language = String(formData.get("language") ?? "").trim();

  if (!title) return { error: t(locale, "admin.titleRequired") };
  if (!certificateId) return { error: t(locale, "admin.certificateRequired") };
  if (language !== "EN" && language !== "DE") {
    return { error: t(locale, "admin.languageRequired") };
  }

  let slug = slugify(title);
  if (!slug) return { error: t(locale, "admin.slugInvalid") };

  const existing = await prisma.deck.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const deck = await prisma.deck.create({
    data: { title, slug, certificateId, language },
  });
  redirect(`/admin/decks/${deck.slug}`);
}

export async function deleteDeck(deckId: string) {
  await requireAdmin();
  await prisma.deck.delete({ where: { id: deckId } });
  redirect("/admin");
}
