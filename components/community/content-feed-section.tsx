"use client";

import { ContentFeed } from "@/components/community/content-feed";
import { ContentViewToggle } from "@/components/community/content-view-toggle";
import { useContentView } from "@/hooks/use-content-view";
import type { ContentListItem, ContentViewMode } from "@/lib/content-views";

type Props = {
  items: ContentListItem[];
  defaultView?: ContentViewMode;
  storageKey?: string;
  emptyMessage?: string;
  showAuthor?: boolean;
  showSpace?: boolean;
  showStats?: boolean;
  showToggle?: boolean;
};

export function ContentFeedSection({
  items,
  defaultView = "grid",
  storageKey,
  emptyMessage,
  showAuthor,
  showSpace,
  showStats,
  showToggle = true,
}: Props) {
  const { view, changeView, ready } = useContentView(defaultView, storageKey);

  if (!ready) {
    return <p className="text-sm text-zinc-400">Зареждане...</p>;
  }

  return (
    <div className="space-y-4">
      {showToggle && items.length > 0 && (
        <div className="flex justify-end">
          <ContentViewToggle view={view} onChange={changeView} />
        </div>
      )}
      <ContentFeed
        items={items}
        view={view}
        emptyMessage={emptyMessage}
        showAuthor={showAuthor}
        showSpace={showSpace}
        showStats={showStats}
      />
    </div>
  );
}
