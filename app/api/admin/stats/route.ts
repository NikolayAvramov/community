import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  try {
    await requireStaff();

    const [users, contents, spaces, fields, forms, banners] = await Promise.all([
      prisma.user.count(),
      prisma.content.count(),
      prisma.space.count(),
      prisma.fieldDefinition.count(),
      prisma.formDefinition.count(),
      prisma.banner.count({ where: { isActive: true } }),
    ]);

    const recentContent = await prisma.content.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });

    return apiSuccess({ users, contents, spaces, fields, forms, banners, recentContent });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
