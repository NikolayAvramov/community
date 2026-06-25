import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const members = await prisma.spaceMember.findMany({
    where: { spaceId: Number(id) },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { joinedAt: "asc" },
  });
  return apiSuccess(members);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const { id } = await params;
    const spaceId = Number(id);
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email) return apiError("Имейл е задължителен", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return apiError("Няма потребител с този имейл", 404);

    const member = await prisma.spaceMember.upsert({
      where: { spaceId_userId: { spaceId, userId: user.id } },
      create: { spaceId, userId: user.id },
      update: {},
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    await prisma.spaceInvitation.updateMany({
      where: { spaceId, email, status: "PENDING" },
      data: { status: "ACCEPTED" },
    });

    return apiSuccess(member, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const { id } = await params;
    const spaceId = Number(id);
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));
    if (!userId) return apiError("userId е задължителен", 400);

    await prisma.spaceMember.delete({
      where: { spaceId_userId: { spaceId, userId } },
    });
    return apiSuccess({ deleted: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
