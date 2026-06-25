import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return apiError("Unauthorized", 401);

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.id } } },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { author: { select: { id: true, name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return apiSuccess(conversations);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { userId } = await request.json();
    if (!userId || userId === session.id) return apiError("Невалиден потребител");

    const target = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!target) return apiError("Потребителят не е намерен", 404);

    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: session.id } } },
          { participants: { some: { userId: Number(userId) } } },
        ],
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    if (existing) return apiSuccess(existing);

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: session.id }, { userId: Number(userId) }],
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        messages: true,
      },
    });

    return apiSuccess(conversation, 201);
  } catch {
    return apiError("Server error", 500);
  }
}
