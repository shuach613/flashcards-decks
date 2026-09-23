import "server-only";
import { prisma } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

export async function ensureDefaultCategories() {
  const seeded = await prisma.appSetting.findUnique({
    where: { key: "default-categories-seeded" },
  });
  if (seeded) return;

  await prisma.$transaction(async (tx) => {
    for (const category of DEFAULT_CATEGORIES) {
      await tx.category.upsert({
        where: { name: category.name },
        create: category,
        update: {},
      });
    }
    await tx.appSetting.upsert({
      where: { key: "default-categories-seeded" },
      create: { key: "default-categories-seeded", value: "true" },
      update: {},
    });
  });
}
