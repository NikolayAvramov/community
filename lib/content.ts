import { prisma } from "@/lib/prisma";
import { slugify, isNumericId } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export async function findContentBySlugOrId(slugOrId: string) {
  if (isNumericId(slugOrId)) {
    return prisma.content.findUnique({ where: { id: Number(slugOrId) } });
  }
  return prisma.content.findFirst({ where: { slug: slugOrId } });
}

export async function generateUniqueContentSlug(title: string, excludeId?: number): Promise<string> {
  let base = slugify(title);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.content.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

export function contentInclude() {
  return {
    author: { select: { id: true, name: true, avatar: true } },
    space: { select: { id: true, name: true, slug: true } },
    tags: { include: { tag: true } },
    _count: { select: { likes: true, comments: true } },
  } satisfies Prisma.ContentInclude;
}
