import type { ContentType } from "@prisma/client";
import { prisma } from "./prisma";

const formInclude = {
  fields: {
    orderBy: { order: "asc" as const },
    include: { field: true },
  },
  space: { select: { id: true, name: true, slug: true } },
};

export async function getFormForContent(spaceId?: number | null, contentType?: ContentType) {
  if (spaceId && contentType) {
    const exact = await prisma.formDefinition.findFirst({
      where: { entityType: "content", spaceId, contentType },
      include: formInclude,
    });
    if (exact) return exact;
  }

  if (spaceId) {
    const spaceForm = await prisma.formDefinition.findFirst({
      where: { entityType: "content", spaceId, contentType: null },
      include: formInclude,
    });
    if (spaceForm) return spaceForm;
  }

  if (contentType) {
    return prisma.formDefinition.findFirst({
      where: { entityType: "content", contentType, spaceId: null },
      include: formInclude,
    });
  }

  return null;
}

export async function getFormWithFields(slug: string) {
  return prisma.formDefinition.findUnique({
    where: { slug },
    include: formInclude,
  });
}
