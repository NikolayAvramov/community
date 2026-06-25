import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { isReservedPageSlug } from "@/lib/page-blocks";

export async function GET() {
  const pages = await prisma.page.findMany({
    include: { blocks: { orderBy: { order: "asc" } }, _count: { select: { blocks: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return apiSuccess(pages);
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const body = await request.json();
    const title = body.title as string;
    if (!title) return apiError("Заглавие е задължително");

    const slug = body.slug?.trim() || slugify(title);
    if (!slug) return apiError("Невалиден slug");
    if (isReservedPageSlug(slug) && !body.isHome) {
      return apiError(`Slug "/${slug}" е запазен. Избери друг.`);
    }

    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) return apiError("Страница с този slug вече съществува");

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        isHome: Boolean(body.isHome),
        published: Boolean(body.published),
      },
    });

    if (body.isHome) {
      await prisma.page.updateMany({
        where: { NOT: { id: page.id } },
        data: { isHome: false },
      });
    }

    return apiSuccess(page, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
