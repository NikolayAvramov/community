import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { findContentBySlugOrId } from "@/lib/content";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await findContentBySlugOrId(slug);
  if (!content) return apiError("Not found", 404);

  const session = await getSession();
  const likeCount = await prisma.like.count({ where: { contentId: content.id } });

  let likedByMe = false;
  if (session) {
    const like = await prisma.like.findUnique({
      where: { userId_contentId: { userId: session.id, contentId: content.id } },
    });
    likedByMe = !!like;
  }

  return apiSuccess({ likeCount, likedByMe });
}

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { slug } = await params;
    const content = await findContentBySlugOrId(slug);
    if (!content) return apiError("Not found", 404);

    await prisma.like.upsert({
      where: { userId_contentId: { userId: session.id, contentId: content.id } },
      create: { userId: session.id, contentId: content.id },
      update: {},
    });

    const likeCount = await prisma.like.count({ where: { contentId: content.id } });
    return apiSuccess({ likeCount, likedByMe: true });
  } catch {
    return apiError("Server error", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { slug } = await params;
    const content = await findContentBySlugOrId(slug);
    if (!content) return apiError("Not found", 404);

    await prisma.like.deleteMany({
      where: { userId: session.id, contentId: content.id },
    });

    const likeCount = await prisma.like.count({ where: { contentId: content.id } });
    return apiSuccess({ likeCount, likedByMe: false });
  } catch {
    return apiError("Server error", 500);
  }
}
