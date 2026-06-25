import { apiSuccess } from "@/lib/api";
import { getActiveBanners } from "@/lib/banners";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placement = searchParams.get("placement") ?? "home";
  const spaceId = searchParams.get("spaceId");
  const spaceSlug = searchParams.get("spaceSlug");

  const banners = await getActiveBanners({
    placement,
    spaceId: spaceId ? Number(spaceId) : undefined,
    spaceSlug: spaceSlug ?? undefined,
  });
  return apiSuccess(banners);
}
