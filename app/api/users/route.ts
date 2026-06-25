import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      _count: { select: { contents: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(users);
}
