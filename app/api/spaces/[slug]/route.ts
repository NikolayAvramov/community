import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { canViewSpace, spaceAccessMeta } from "@/lib/space-access";
import { resolveSpaceBySlug } from "@/lib/space-slug";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();

  const resolved = await resolveSpaceBySlug(slug, {
    collection: true,
    members: { select: { userId: true } },
    _count: { select: { contents: true, members: true } },
  });

  if (!resolved || !canViewSpace(session, resolved.space)) {
    return apiError("Секцията не е намерена или нямате достъп", 404);
  }

  if (resolved.redirected) {
    const url = new URL(request.url);
    url.pathname = `/api/spaces/${resolved.slug}`;
    return NextResponse.redirect(url, 308);
  }

  const { space } = resolved;

  return apiSuccess({
    ...space,
    ...spaceAccessMeta(session, space),
    members: undefined,
  });
}
