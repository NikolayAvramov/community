import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { spaceInvitationSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";
import { buildSpaceInviteUrl } from "@/lib/space-invitations";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invitations = await prisma.spaceInvitation.findMany({
    where: { spaceId: Number(id), status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  return apiSuccess(invitations);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireStaff();
    const { id } = await params;
    const spaceId = Number(id);
    const body = await request.json();
    const parsed = spaceInvitationSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const email = parsed.data.email.toLowerCase();
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) return apiError("Секцията не е намерена", 404);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const member = await prisma.spaceMember.findUnique({
        where: { spaceId_userId: { spaceId, userId: existingUser.id } },
      });
      if (member) return apiError("Този мембър вече е в секцията", 400);
    }

    await prisma.spaceInvitation.updateMany({
      where: { spaceId, email, status: "PENDING" },
      data: { status: "REVOKED" },
    });

    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const token = randomUUID();
    const invitation = await prisma.spaceInvitation.create({
      data: {
        spaceId,
        email,
        token,
        invitedBy: session.id,
        expiresAt,
      },
    });

    const origin = new URL(request.url).origin;
    return apiSuccess(
      {
        ...invitation,
        inviteUrl: buildSpaceInviteUrl(token, origin),
      },
      201,
    );
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
    const { searchParams } = new URL(request.url);
    const invitationId = Number(searchParams.get("invitationId"));
    if (!invitationId) return apiError("invitationId е задължителен", 400);

    await prisma.spaceInvitation.update({
      where: { id: invitationId, spaceId: Number(id) },
      data: { status: "REVOKED" },
    });
    return apiSuccess({ revoked: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
