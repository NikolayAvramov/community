import { prisma } from "@/lib/prisma";
import { getSession, requireSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { isInvitationValid } from "@/lib/space-invitations";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    if (!token) return apiError("Липсва токен", 400);

    const invitation = await prisma.spaceInvitation.findUnique({
      where: { token },
      include: { space: { select: { id: true, name: true, slug: true } } },
    });

    if (!invitation || !isInvitationValid(invitation)) {
      return apiError("Поканата е невалидна или е изтекла", 403);
    }

    if (session.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return apiError("Поканата е изпратена до друг имейл. Влезте с правилния акаунт.", 403);
    }

    await prisma.spaceMember.upsert({
      where: {
        spaceId_userId: { spaceId: invitation.spaceId, userId: session.id },
      },
      create: { spaceId: invitation.spaceId, userId: session.id },
      update: {},
    });

    await prisma.spaceInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    return apiSuccess({
      space: invitation.space,
      redirect: `/spaces/${invitation.space.slug}`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : 500;
    return apiError(message, status);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  if (!token) return apiError("Липсва токен", 400);

  const session = await getSession();
  const invitation = await prisma.spaceInvitation.findUnique({
    where: { token },
    include: { space: { select: { id: true, name: true, slug: true } } },
  });

  if (!invitation || !isInvitationValid(invitation)) {
    return apiError("Поканата е невалидна или е изтекла", 404);
  }

  return apiSuccess({
    email: invitation.email,
    space: invitation.space,
    requiresLogin: !session,
    emailMatch: session ? session.email.toLowerCase() === invitation.email.toLowerCase() : null,
  });
}
