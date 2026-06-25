import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { navigationItemSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const { id } = await params;
    const body = await request.json();
    const parsed = navigationItemSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const item = await prisma.navigationItem.update({
      where: { id: Number(id) },
      data: parsed.data,
    });
    return apiSuccess(item);
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
    await prisma.navigationItem.delete({ where: { id: Number(id) } });
    return apiSuccess({ deleted: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
