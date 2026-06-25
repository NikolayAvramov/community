import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api";

export async function GET() {
  const items = await prisma.navigationItem.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { order: "asc" },
  });
  return apiSuccess(items);
}
