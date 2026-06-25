export type ContentViewMode = "grid" | "list" | "compact" | "magazine";

export const CONTENT_VIEW_MODES: Record<ContentViewMode, string> = {
  grid: "Карти",
  list: "Списък",
  compact: "Компактен",
  magazine: "Списание",
};

export const CONTENT_VIEW_STORAGE_KEY = "community-content-view";

export function isContentViewMode(value: string): value is ContentViewMode {
  return value in CONTENT_VIEW_MODES;
}

export type ContentListItem = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  type: string;
  coverImage?: string | null;
  createdAt: string;
  author?: { name: string; id?: number; avatar?: string | null };
  space?: { name: string; slug?: string };
  _count?: { likes: number; comments: number };
};
