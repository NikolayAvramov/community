import { prisma } from "@/lib/prisma";
import { getSession, requireModerator } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const comment = await prisma.comment.findUnique({ where: { id: Number(id) } });
    if (!comment) return apiError("Not found", 404);

    const canDelete =
      comment.authorId === session.id ||
      session.role === "ADMIN" ||
      session.role === "MODERATOR";

    if (!canDelete) return apiError("Forbidden", 403);

    await prisma.comment.delete({ where: { id: comment.id } });
    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Server error", 500);
  }
}
