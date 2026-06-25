import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { contentSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { saveCustomFieldValues } from "@/lib/custom-fields";
import { generateUniqueContentSlug } from "@/lib/content";
import { canPostInSpace, canViewSpace } from "@/lib/space-access";
import { resolveSpaceBySlug } from "@/lib/space-slug";
import type { ContentType, Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ContentType | null;
  const spaceId = searchParams.get("spaceId");
  const spaceSlug = searchParams.get("spaceSlug");
  const ids = searchParams.get("ids");
  const limit = searchParams.get("limit");
  const status = searchParams.get("status") ?? "PUBLISHED";

  const where: Prisma.ContentWhereInput = {
    status: status as "PUBLISHED" | "DRAFT" | "ARCHIVED",
  };
  if (type) where.type = type;
  if (spaceId) where.spaceId = Number(spaceId);
  if (spaceSlug) {
    const session = await getSession();
    const resolved = await resolveSpaceBySlug(spaceSlug, {
      members: { select: { userId: true } },
    });
    if (!resolved || !canViewSpace(session, resolved.space)) {
      return apiSuccess([]);
    }
    where.spaceId = resolved.space.id;
  }
  if (ids) {
    const idList = ids.split(",").map(Number).filter(Boolean);
    if (idList.length) where.id = { in: idList };
  }

  const contents = await prisma.content.findMany({
    where,
    take: limit ? Number(limit) : undefined,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      space: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(contents);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = contentSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;

    if (data.spaceId) {
      const space = await prisma.space.findUnique({
        where: { id: data.spaceId },
        include: { members: { select: { userId: true } } },
      });
      if (!space) return apiError("Секцията не е намерена", 404);
      if (!canPostInSpace(session, space)) {
        return apiError("Нямате право да публикувате в тази секция", 403);
      }
    }

    const slug = data.slug?.trim() || await generateUniqueContentSlug(data.title);

    const content = await prisma.content.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        body: data.body,
        type: data.type,
        status: data.status ?? "DRAFT",
        coverImage: data.coverImage,
        spaceId: data.spaceId ?? undefined,
        eventStart: data.eventStart ? new Date(data.eventStart) : undefined,
        eventEnd: data.eventEnd ? new Date(data.eventEnd) : undefined,
        eventLocation: data.eventLocation,
        authorId: session.id,
        publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
      },
    });

    if (data.tags?.length) {
      for (const tagName of data.tags) {
        const tagSlug = slugify(tagName);
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          create: { name: tagName, slug: tagSlug },
          update: {},
        });
        await prisma.tagOnContent.create({ data: { contentId: content.id, tagId: tag.id } });
      }
    }

    if (data.customFields) {
      await saveCustomFieldValues("content", content.id, data.customFields);
    }

    return apiSuccess(content, 201);
  } catch (error) {
    console.error(error);
    return apiError("Грешка при създаване", 500);
  }
}
