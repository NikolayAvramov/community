import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { z } from "zod";

const messageSchema = z.object({ body: z.string().min(1).max(2000) });

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return apiError("Unauthorized", 401);

  const { id } = await params;
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: Number(id), userId: session.id } },
  });
  if (!participant) return apiError("Forbidden", 403);

  const messages = await prisma.message.findMany({
    where: { conversationId: Number(id) },
    include: { author: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return apiSuccess(messages);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: Number(id), userId: session.id } },
    });
    if (!participant) return apiError("Forbidden", 403);

    const body = await request.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const message = await prisma.message.create({
      data: {
        conversationId: Number(id),
        authorId: session.id,
        body: parsed.data.body,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    await prisma.conversation.update({
      where: { id: Number(id) },
      data: { updatedAt: new Date() },
    });

    return apiSuccess(message, 201);
  } catch {
    return apiError("Server error", 500);
  }
}
