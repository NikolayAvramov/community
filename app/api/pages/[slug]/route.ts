import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await prisma.page.findFirst({
    where: slug === "home" ? { isHome: true, published: true } : { slug, published: true },
    include: { blocks: { orderBy: { order: "asc" } } },
  });

  if (!page) return apiError("Not found", 404);
  return apiSuccess(page);
}
