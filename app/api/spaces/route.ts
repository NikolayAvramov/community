import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { canViewSpace, spaceAccessMeta } from "@/lib/space-access";

const spaceInclude = {
  collection: true,
  members: { select: { userId: true } },
  _count: { select: { contents: true, members: true } },
} as const;

export async function GET() {
  const session = await getSession();
  const spaces = await prisma.space.findMany({
    include: spaceInclude,
    orderBy: { order: "asc" },
  });

  const visible = spaces
    .filter((space) => canViewSpace(session, space))
    .map((space) => ({
      ...space,
      ...spaceAccessMeta(session, space),
      members: undefined,
    }));

  return apiSuccess(visible);
}

export async function POST() {
  return apiError("Not found", 404);
}
