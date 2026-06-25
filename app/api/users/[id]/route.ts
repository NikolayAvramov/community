import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";
import { getCustomFieldValues } from "@/lib/custom-fields";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      contents: {
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          excerpt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { contents: true, comments: true, likes: true } },
    },
  });

  if (!user) return apiError("Not found", 404);

  const customFields = await getCustomFieldValues("user", user.id);
  return apiSuccess({ ...user, customFields });
}
