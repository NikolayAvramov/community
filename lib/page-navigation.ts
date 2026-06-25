import { prisma } from "@/lib/prisma";

type PageNav = {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  isHome: boolean;
};

export async function syncPageNavigation(
  page: PageNav,
  addToNav: boolean,
  previousSlug?: string,
) {
  if (previousSlug && previousSlug !== page.slug) {
    await prisma.navigationItem.deleteMany({
      where: {
        OR: [
          { pageId: page.id },
          { href: `/${previousSlug}`, pageId: null },
        ],
      },
    });
  }

  if (addToNav && page.published && !page.isHome) {
    const href = `/${page.slug}`;
    const existing = await prisma.navigationItem.findUnique({ where: { pageId: page.id } });

    if (existing) {
      await prisma.navigationItem.update({
        where: { id: existing.id },
        data: { label: page.title, href },
      });
    } else {
      const staleHref = await prisma.navigationItem.findFirst({ where: { href, pageId: null } });
      if (staleHref) {
        await prisma.navigationItem.update({
          where: { id: staleHref.id },
          data: { label: page.title, href, pageId: page.id },
        });
      } else {
        const count = await prisma.navigationItem.count();
        await prisma.navigationItem.create({
          data: { label: page.title, href, pageId: page.id, order: count },
        });
      }
    }
    return;
  }

  await prisma.navigationItem.deleteMany({ where: { pageId: page.id } });
}

export async function pageInNavigation(pageId: number) {
  const linked = await prisma.navigationItem.findUnique({ where: { pageId } });
  return Boolean(linked);
}
