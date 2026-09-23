import "server-only";
import { prisma } from "@/lib/db";
import { ensureDefaultCategories } from "@/lib/categories-server";
import { DEFAULT_TRACKS } from "@/lib/tracks";

export async function ensureDefaultTracks() {
  await ensureDefaultCategories();

  for (const definition of DEFAULT_TRACKS) {
    const categories = await prisma.category.findMany({
      where: { name: { in: [...definition.categoryNames] } },
      select: { id: true },
    });

    await prisma.track.upsert({
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
