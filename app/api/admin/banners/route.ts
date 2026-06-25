import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { bannerSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";

const bannerInclude = { space: { select: { id: true, name: true, slug: true } } };

export async function GET() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
    include: bannerInclude,
  });
  return apiSuccess(banners);
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const body = await request.json();
    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const spaceId = data.placement === "space" ? (data.spaceId ?? null) : null;

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl || null,
        linkUrl: data.linkUrl,
        linkText: data.linkText,
        isActive: data.isActive ?? true,
        order: data.order ?? 0,
        placement: data.placement ?? "home",
        spaceId,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
      include: bannerInclude,
    });

    return apiSuccess(banner, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
