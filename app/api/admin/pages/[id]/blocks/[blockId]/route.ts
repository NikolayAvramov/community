import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; blockId: string }> }) {
  try {
    await requireStaff();
    const { blockId } = await params;
    const body = await request.json();

    const block = await prisma.pageBlock.update({
      where: { id: Number(blockId) },
      data: {
        type: body.type,
        order: body.order,
        config: body.config,
      },
    });

    return apiSuccess(block);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; blockId: string }> }) {
  try {
    await requireStaff();
    const { blockId } = await params;
    await prisma.pageBlock.delete({ where: { id: Number(blockId) } });
    return apiSuccess({ deleted: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
