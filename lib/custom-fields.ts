import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { ContentType } from "@prisma/client";

export async function saveCustomFieldValues(
  entityType: string,
  entityId: number,
  customFields: Record<string, unknown>,
) {
  const entries = Object.entries(customFields);
  if (entries.length === 0) return;

  const fieldKeys = entries.map(([key]) => key);
  const fields = await prisma.fieldDefinition.findMany({
    where: { key: { in: fieldKeys }, entityType, isActive: true },
  });

  const fieldMap = new Map(fields.map((f) => [f.key, f]));

  await Promise.all(
    entries.map(async ([key, value]) => {
      const field = fieldMap.get(key);
      if (!field) return;

      await prisma.customFieldValue.upsert({
        where: {
          fieldId_entityType_entityId: {
            fieldId: field.id,
            entityType,
            entityId,
          },
        },
        create: {
          fieldId: field.id,
          entityType,
          entityId,
          value: value as Prisma.InputJsonValue,
        },
        update: {
          value: value as Prisma.InputJsonValue,
        },
      });
    }),
  );
}

export async function getCustomFieldValues(entityType: string, entityId: number) {
  const values = await prisma.customFieldValue.findMany({
    where: { entityType, entityId },
    include: { field: true },
  });

  return values.reduce<Record<string, unknown>>((acc, v) => {
    acc[v.field.key] = v.value;
    return acc;
  }, {});
}

export async function getFormWithFields(slug: string) {
  const { getFormWithFields: getBySlug } = await import("./forms");
  return getBySlug(slug);
}

export async function getFormForContentType(type: ContentType) {
  const { getFormForContent } = await import("./forms");
  return getFormForContent(null, type);
}
