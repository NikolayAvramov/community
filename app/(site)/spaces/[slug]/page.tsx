import { notFound, permanentRedirect } from "next/navigation";
import { resolveSpaceBySlug } from "@/lib/space-slug";
import { SpaceDetailClient } from "./space-detail-client";

export default async function SpaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = await resolveSpaceBySlug(slug);

  if (!resolved) notFound();

  if (resolved.redirected) {
    permanentRedirect(`/spaces/${resolved.slug}`);
  }

  return <SpaceDetailClient slug={resolved.slug} />;
}
