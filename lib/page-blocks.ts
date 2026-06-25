import { SPACE_LABEL } from "./space-labels";

export const PAGE_BLOCK_TYPES = {
  hero: "Hero секция",
  text: "Текст",
  posts: "Последни постове",
  space_posts: `Постове от ${SPACE_LABEL.oneLower}`,
  spaces: SPACE_LABEL.many,
  cta: "Call to Action",
} as const;

export type PageBlockType = keyof typeof PAGE_BLOCK_TYPES;

export const RESERVED_PAGE_SLUGS = new Set([
  "login", "register", "create", "admin", "api", "members", "messages",
  "profile", "spaces", "content", "p", "home", "invitations", "search", "support-access", "_next",
]);

export function isReservedPageSlug(slug: string): boolean {
  return RESERVED_PAGE_SLUGS.has(slug.toLowerCase());
}

export function getPageUrl(page: { slug: string; isHome: boolean }): string {
  return page.isHome ? "/" : `/${page.slug}`;
}
