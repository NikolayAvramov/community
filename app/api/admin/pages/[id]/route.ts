import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { isReservedPageSlug } from "@/lib/page-blocks";
import { pageInNavigation, syncPageNavigation } from "@/lib/page-navigation";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pageId = Number(id);
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!page) return apiError("Not found", 404);
  const inNav = await pageInNavigation(pageId);
  return apiSuccess({ ...page, inNav });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const { id } = await params;
    const body = await request.json();
    const pageId = Number(id);

    const before = await prisma.page.findUnique({ where: { id: pageId } });
    if (!before) return apiError("Not found", 404);

    if (body.slug && isReservedPageSlug(body.slug) && !body.isHome) {
      return apiError(`Slug "/${body.slug}" е запазен`);
    }

    const page = await prisma.page.update({
      where: { id: pageId },
      data: {
        title: body.title,
        slug: body.slug,
        published: body.published,
        isHome: body.isHome,
      },
    });

    if (body.isHome) {
      await prisma.page.updateMany({
        where: { NOT: { id: page.id } },
        data: { isHome: false },
      });
    }

    await syncPageNavigation(page, Boolean(body.addToNav), before.slug);

    const inNav = await pageInNavigation(page.id);
    return apiSuccess({ ...page, inNav });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const { id } = await params;
    await prisma.page.delete({ where: { id: Number(id) } });
    return apiSuccess({ deleted: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
