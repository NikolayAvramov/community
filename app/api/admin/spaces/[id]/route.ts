import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { spaceSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";
import { recordSpaceSlugChange } from "@/lib/space-slug";
import { normalizeSlug } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const space = await prisma.space.findUnique({
    where: { id: Number(id) },
    include: {
      collection: true,
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { joinedAt: "asc" },
      },
      invitations: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { contents: true, members: true } },
    },
  });
  if (!space) return apiError("Не е намерена", 404);
  return apiSuccess(space);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const { id } = await params;
    const body = await request.json();
    const parsed = spaceSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const current = await prisma.space.findUnique({ where: { id: Number(id) } });
    if (!current) return apiError("Не е намерена", 404);

    const rawSlug = data.slug;
    const newSlug = rawSlug ? normalizeSlug(rawSlug) : current.slug;
    const aliases = rawSlug && rawSlug !== newSlug ? [rawSlug] : [];

    if (newSlug !== current.slug || aliases.length > 0) {
      await recordSpaceSlugChange(current.id, current.slug, newSlug, aliases);
    }

    const space = await prisma.space.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        slug: newSlug,
        description: data.description,
        icon: data.icon,
        color: data.color,
        order: data.order,
        collectionId: data.collectionId,
        accessMode: data.accessMode,
        allowMemberPosts: data.allowMemberPosts,
        isPrivate: data.accessMode === "RESTRICTED" || data.isPrivate,
      },
      include: {
        _count: { select: { contents: true, members: true } },
      },
    });

    return apiSuccess(space);
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
    await prisma.space.delete({ where: { id: Number(id) } });
    return apiSuccess({ deleted: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
