import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { commentSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";
import { findContentBySlugOrId } from "@/lib/content";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await findContentBySlugOrId(slug);
  if (!content) return apiError("Not found", 404);

  const comments = await prisma.comment.findMany({
    where: { contentId: content.id },
    include: { author: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return apiSuccess(comments);
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { slug } = await params;
    const content = await findContentBySlugOrId(slug);
    if (!content) return apiError("Not found", 404);

    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const comment = await prisma.comment.create({
      data: {
        body: parsed.data.body,
        contentId: content.id,
        authorId: session.id,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    return apiSuccess(comment, 201);
  } catch {
    return apiError("Server error", 500);
  }
}
