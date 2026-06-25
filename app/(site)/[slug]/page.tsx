import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isReservedPageSlug } from "@/lib/page-blocks";
import { PageRenderer } from "@/components/community/page-renderer";

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (isReservedPageSlug(slug)) notFound();

  const page = await prisma.page.findFirst({
    where: { slug, published: true },
    include: { blocks: { orderBy: { order: "asc" } } },
  });

  if (!page) notFound();

  const blocks = page.blocks.map((block) => ({
    ...block,
    config: (block.config ?? {}) as Record<string, unknown>,
  }));

  return <PageRenderer blocks={blocks} />;
}
