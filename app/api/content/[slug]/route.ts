import { prisma } from "@/lib/prisma";
import { getSession, requireModerator } from "@/lib/auth";
import { contentSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";
import { getCustomFieldValues } from "@/lib/custom-fields";
import { findContentBySlugOrId, contentInclude } from "@/lib/content";
import { isNumericId } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();

  const content = await prisma.content.findFirst({
    where: isNumericId(slug) ? { id: Number(slug) } : { slug },
    include: {
      ...contentInclude(),
      space: true,
    },
  });

  if (!content) return apiError("Not found", 404);

  const customFields = await getCustomFieldValues("content", content.id);

  let likedByMe = false;
  if (session) {
    const like = await prisma.like.findUnique({
      where: { userId_contentId: { userId: session.id, contentId: content.id } },
    });
    likedByMe = !!like;
  }

  return apiSuccess({ ...content, customFields, likedByMe });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { slug } = await params;
    const existing = await findContentBySlugOrId(slug);
    if (!existing) return apiError("Not found", 404);

    const canEdit = existing.authorId === session.id || session.role === "ADMIN" || session.role === "MODERATOR";
    if (!canEdit) return apiError("Forbidden", 403);

    const body = await request.json();
    const parsed = contentSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const content = await prisma.content.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        excerpt: data.excerpt,
        body: data.body,
        status: data.status,
        coverImage: data.coverImage,
        spaceId: data.spaceId ?? undefined,
        eventStart: data.eventStart ? new Date(data.eventStart) : undefined,
        eventEnd: data.eventEnd ? new Date(data.eventEnd) : undefined,
        eventLocation: data.eventLocation,
        publishedAt: data.status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined,
      },
    });

    if (data.customFields) {
      const { saveCustomFieldValues } = await import("@/lib/custom-fields");
      await saveCustomFieldValues("content", content.id, data.customFields);
    }

    return apiSuccess(content);
  } catch {
    return apiError("Server error", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireModerator();
    const { slug } = await params;
    const existing = await findContentBySlugOrId(slug);
    if (!existing) return apiError("Not found", 404);
    await prisma.content.delete({ where: { id: existing.id } });
    return apiSuccess({ deleted: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
