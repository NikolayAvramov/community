import { prisma } from "./prisma";
import { resolveSpaceBySlug } from "./space-slug";

type BannerQuery = {
  placement?: string;
  spaceId?: number;
  spaceSlug?: string;
};

function dateFilters() {
  const now = new Date();
  return [
    { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
    { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
  ];
}

export async function getActiveBanners(options: BannerQuery = {}) {
  const { placement = "home", spaceId, spaceSlug } = options;

  let targetSpaceId = spaceId;
  if (spaceSlug && !targetSpaceId) {
    const resolved = await resolveSpaceBySlug(spaceSlug);
    targetSpaceId = resolved?.space.id;
  }

  if (targetSpaceId) {
    return prisma.banner.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { spaceId: targetSpaceId, placement: "space" },
              { placement: "global", spaceId: null },
            ],
          },
          ...dateFilters(),
        ],
      },
      orderBy: { order: "asc" },
      include: { space: { select: { id: true, name: true, slug: true } } },
    });
  }

  return prisma.banner.findMany({
    where: {
      isActive: true,
      spaceId: null,
      OR: [{ placement }, { placement: "global" }],
      AND: dateFilters(),
    },
    orderBy: { order: "asc" },
    include: { space: { select: { id: true, name: true, slug: true } } },
  });
}
