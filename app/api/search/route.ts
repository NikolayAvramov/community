import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(searchParams.get("limit")) || 8, 20);

  if (!q || q.length < 2) {
    return apiSuccess({ contents: [], spaces: [], users: [], pages: [] });
  }

  const [contents, spaces, users, pages] = await Promise.all([
    prisma.content.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
          { body: { contains: q } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        excerpt: true,
        space: { select: { name: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.space.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      },
      select: { id: true, name: true, slug: true, description: true },
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
        ],
      },
      select: { id: true, name: true, avatar: true, bio: true },
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.page.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: q } },
          { slug: { contains: q } },
        ],
      },
      select: { id: true, title: true, slug: true },
      take: limit,
      orderBy: { title: "asc" },
    }),
  ]);

  return apiSuccess({ contents, spaces, users, pages });
}
