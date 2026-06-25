import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { bannerSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const { id } = await params;
    const body = await request.json();
    const parsed = bannerSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const placement = data.placement;
    const spaceId =
      placement === "space"
        ? (data.spaceId ?? undefined)
        : placement !== undefined
          ? null
          : undefined;

    const banner = await prisma.banner.update({
      where: { id: Number(id) },
      data: {
        ...data,
        imageUrl: data.imageUrl === "" ? null : data.imageUrl,
        spaceId,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      },
      include: { space: { select: { id: true, name: true, slug: true } } },
    });

    return apiSuccess(banner);
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
    await prisma.banner.delete({ where: { id: Number(id) } });
    return apiSuccess({ deleted: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
