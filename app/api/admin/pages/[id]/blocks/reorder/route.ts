import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const { id } = await params;
    const { blockIds } = await request.json() as { blockIds: number[] };

    if (!Array.isArray(blockIds)) return apiError("Invalid block order");

    await Promise.all(
      blockIds.map((blockId, order) =>
        prisma.pageBlock.updateMany({
          where: { id: blockId, pageId: Number(id) },
          data: { order },
        }),
      ),
    );

    const blocks = await prisma.pageBlock.findMany({
      where: { pageId: Number(id) },
      orderBy: { order: "asc" },
    });

    return apiSuccess(blocks);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
