import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

type SpaceInclude = Prisma.SpaceInclude;

export type ResolvedSpace<T extends SpaceInclude | undefined = undefined> = {
  space: Prisma.SpaceGetPayload<{ include: T }>;
  slug: string;
  redirected: boolean;
  fromSlug?: string;
};

export async function resolveSpaceBySlug<T extends SpaceInclude | undefined = undefined>(
  slug: string,
  include?: T,
): Promise<ResolvedSpace<T> | null> {
  const space = await prisma.space.findUnique({
    where: { slug },
    include,
  });

  if (space) {
    return { space: space as ResolvedSpace<T>["space"], slug, redirected: false };
  }

  const redirect = await prisma.spaceSlugRedirect.findUnique({
    where: { oldSlug: slug },
  });
  if (!redirect) return null;

  const redirectedSpace = await prisma.space.findUnique({
    where: { id: redirect.spaceId },
    include,
  });
  if (!redirectedSpace) return null;

  return {
    space: redirectedSpace as ResolvedSpace<T>["space"],
    slug: redirectedSpace.slug,
    redirected: true,
    fromSlug: slug,
  };
}

export async function recordSpaceSlugChange(
  spaceId: number,
  oldSlug: string,
  newSlug: string,
  aliases: string[] = [],
) {
  const slugsToRedirect = [...new Set([oldSlug, ...aliases].filter((s) => s && s !== newSlug))];
  if (slugsToRedirect.length === 0) return;

  await prisma.$transaction([
    ...slugsToRedirect.map((slug) =>
      prisma.spaceSlugRedirect.upsert({
        where: { oldSlug: slug },
        create: { oldSlug: slug, spaceId },
        update: { spaceId },
      }),
    ),
    prisma.spaceSlugRedirect.deleteMany({ where: { oldSlug: newSlug } }),
  ]);
}

export async function resolveSpaceSlugParam(slug: string): Promise<string | null> {
  const resolved = await resolveSpaceBySlug(slug);
  return resolved?.slug ?? null;
}
