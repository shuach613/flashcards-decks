import "server-only";
import { prisma } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

export async function ensureDefaultCategories() {
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      create: category,
      update: {},
    });
  }
}
