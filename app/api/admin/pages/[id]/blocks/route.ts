import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const { id } = await params;
    const body = await request.json();

    if (!body.type) return apiError("Тип блок е задължителен");

    const count = await prisma.pageBlock.count({ where: { pageId: Number(id) } });
    const block = await prisma.pageBlock.create({
      data: {
        pageId: Number(id),
        type: body.type,
        order: body.order ?? count,
        config: body.config ?? {},
      },
    });

    return apiSuccess(block, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
