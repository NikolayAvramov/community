import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { navigationItemSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  const items = await prisma.navigationItem.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
  return apiSuccess(items);
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const body = await request.json();
    const parsed = navigationItemSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const item = await prisma.navigationItem.create({ data: parsed.data });
    return apiSuccess(item, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
