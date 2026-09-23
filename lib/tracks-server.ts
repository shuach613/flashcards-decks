import "server-only";
import { prisma } from "@/lib/db";
import { ensureDefaultCategories } from "@/lib/categories-server";
import { DEFAULT_TRACKS } from "@/lib/tracks";

export async function ensureDefaultTracks() {
  await ensureDefaultCategories();

  const seeded = await prisma.appSetting.findUnique({
    where: { key: "default-tracks-seeded" },
  });
  if (seeded) return;

  await prisma.$transaction(async (tx) => {
    for (const definition of DEFAULT_TRACKS) {
    const categories = await tx.category.findMany({
      where: { name: { in: [...definition.categoryNames] } },
      select: { id: true },
    });

    await tx.track.upsert({
      where: { key: definition.key },
      create: {
        key: definition.key,
        name: definition.name,
        order: definition.order,
        categories: {
          create: categories.map((category) => ({
            categoryId: category.id,
          })),
        },
      },
      update: {},
    });
    }
    await tx.appSetting.upsert({
      where: { key: "default-tracks-seeded" },
      create: { key: "default-tracks-seeded", value: "true" },
      update: {},
    });
  });
}

export function deckAccessWhere(user: { id: string; role: string }) {
  if (user.role === "ADMIN") return {};

  return {
    category: {
      tracks: {
        some: {
          track: {
            users: { some: { userId: user.id } },
          },
        },
      },
    },
  };
}

export async function userHasTracks(userId: string) {
  return (await prisma.userTrack.count({ where: { userId } })) > 0;
}
