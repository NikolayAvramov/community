import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { spaceSchema, collectionSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";
import { slugify, normalizeSlug } from "@/lib/utils";

export async function GET() {
  const spaces = await prisma.space.findMany({
    include: {
      collection: true,
      _count: { select: { contents: true } },
    },
    orderBy: { order: "asc" },
  });
  return apiSuccess(spaces);
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const body = await request.json();
    const parsed = spaceSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const space = await prisma.space.create({
      data: {
        name: data.name,
        slug: data.slug ? normalizeSlug(data.slug) : slugify(data.name),
        description: data.description,
        icon: data.icon,
        color: data.color,
        isPrivate: data.accessMode === "RESTRICTED" || data.isPrivate === true,
        accessMode: data.accessMode ?? "PUBLIC",
        allowMemberPosts: data.allowMemberPosts ?? true,
        order: data.order ?? 0,
        collectionId: data.collectionId ?? undefined,
      },
    });

    return apiSuccess(space, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}

export async function PUT(request: Request) {
  try {
    await requireStaff();
    const body = await request.json();
    const parsed = collectionSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const collection = await prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug ?? slugify(data.name),
        description: data.description,
        order: data.order ?? 0,
      },
    });

    return apiSuccess(collection, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
