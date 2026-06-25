import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api";
import { getFormForContent } from "@/lib/forms";
import type { ContentType } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const form = await prisma.formDefinition.findUnique({
      where: { slug },
      include: {
        fields: { orderBy: { order: "asc" }, include: { field: true } },
        space: { select: { id: true, name: true, slug: true } },
      },
    });
    return apiSuccess(form);
  }

  const spaceId = searchParams.get("spaceId");
  const type = searchParams.get("type") as ContentType | null;

  if (spaceId || type) {
    const form = await getFormForContent(
      spaceId ? Number(spaceId) : null,
      type ?? undefined,
    );
    return apiSuccess(form);
  }

  const forms = await prisma.formDefinition.findMany({
    include: {
      space: { select: { id: true, name: true, slug: true } },
      _count: { select: { fields: true } },
    },
  });
  return apiSuccess(forms);
}
