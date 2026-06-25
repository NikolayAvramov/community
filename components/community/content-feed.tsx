"use client";

import Link from "next/link";
import { ContentCover } from "@/components/community/content-cover";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { getAvatarGradient, getContentVisuals } from "@/lib/content-visuals";
import type { ContentListItem, ContentViewMode } from "@/lib/content-views";
import { formatDate } from "@/lib/utils";
import { Calendar, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  items: ContentListItem[];
  view: ContentViewMode;
  emptyMessage?: string;
  showAuthor?: boolean;
  showSpace?: boolean;
  showStats?: boolean;
};

function contentHref(item: ContentListItem) {
  return `/content/${item.slug || item.id}`;
}

function TypeBadge({ type }: { type: string }) {
  const visual = getContentVisuals(type);
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", visual.badge)}>
      {CONTENT_TYPE_LABELS[type] ?? type}
    </span>
  );
}

function AuthorChip({ name, avatar }: { name: string; avatar?: string | null }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br text-[10px] font-bold text-white",
          !avatar && getAvatarGradient(name),
        )}
      >
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
      </span>
      <span>{name}</span>
    </span>
  );
}

function MetaLine({
  item,
  showAuthor,
  showSpace,
  showStats,
  className,
}: {
  item: ContentListItem;
  showAuthor: boolean;
  showSpace: boolean;
  showStats: boolean;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400", className)}>
      {showAuthor && item.author && <AuthorChip name={item.author.name} avatar={item.author.avatar} />}
      {showSpace && item.space && (
        <>
          {showAuthor && item.author && <span className="text-slate-300">·</span>}
          <span className="rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
            {item.space.name}
          </span>
        </>
      )}
      {(showAuthor || showSpace) && <span className="text-slate-300">·</span>}
      <span>{formatDate(item.createdAt)}</span>
      {showStats && (
        <span className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-0.5 text-rose-400">
            <Heart className="h-3 w-3" />
            {item._count?.likes ?? 0}
          </span>
          <span className="flex items-center gap-0.5 text-sky-400">
            <MessageCircle className="h-3 w-3" />
            {item._count?.comments ?? 0}
          </span>
        </span>
      )}
    </p>
  );
}

function GridCard({ item, showAuthor, showSpace, showStats }: Omit<Props, "view" | "items" | "emptyMessage"> & { item: ContentListItem }) {
  const visual = getContentVisuals(item.type);

  return (
    <Link href={contentHref(item)}>
      <article className={cn("group card-shine flex h-full flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] dark:border-slate-800/80 dark:bg-slate-900", visual.glow)}>
        <ContentCover
          type={item.type}
          title={item.title}
          coverImage={item.coverImage}
          className="h-48"
          overlay
        />
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <TypeBadge type={item.type} />
            {item.type === "EVENT" && <Calendar className="h-4 w-4 text-orange-400" />}
          </div>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-violet-600 dark:text-slate-50 dark:group-hover:text-violet-400">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">{item.excerpt}</p>
          )}
          <MetaLine
            item={item}
            showAuthor={showAuthor ?? true}
            showSpace={showSpace ?? true}
            showStats={showStats ?? true}
            className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800"
          />
        </div>
      </article>
    </Link>
  );
}

function ListRow({ item, showAuthor, showSpace, showStats }: Omit<Props, "view" | "items" | "emptyMessage"> & { item: ContentListItem }) {
  return (
    <Link href={contentHref(item)}>
      <article className="group card-shine flex overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] dark:border-slate-800 dark:bg-slate-900">
        <ContentCover
          type={item.type}
          title={item.title}
          coverImage={item.coverImage}
          className="h-auto w-32 shrink-0 sm:w-44"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center p-5">
          <div className="mb-2 flex items-center gap-2">
            <TypeBadge type={item.type} />
          </div>
          <h3 className="line-clamp-2 text-lg font-bold group-hover:text-violet-600 dark:group-hover:text-violet-400">
            {item.title}
          </h3>
          {item.excerpt && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.excerpt}</p>}
          <MetaLine
            item={item}
            showAuthor={showAuthor ?? true}
            showSpace={showSpace ?? true}
            showStats={showStats ?? true}
            className="mt-3"
          />
        </div>
      </article>
    </Link>
  );
}

function CompactRow({ item, showAuthor, showSpace }: Omit<Props, "view" | "items" | "emptyMessage" | "showStats"> & { item: ContentListItem }) {
  const visual = getContentVisuals(item.type);
  return (
    <Link href={contentHref(item)}>
      <div className="flex items-center gap-3 rounded-xl border border-white/80 bg-white px-4 py-3 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] dark:border-slate-800 dark:bg-slate-900">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg", visual.gradient)}>
          {visual.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{item.title}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {showAuthor && item.author ? `${item.author.name} · ` : ""}
            {showSpace && item.space ? `${item.space.name} · ` : ""}
            {formatDate(item.createdAt)}
          </p>
        </div>
        <TypeBadge type={item.type} />
      </div>
    </Link>
  );
}

function MagazineLayout({ items, showAuthor, showSpace, showStats }: Omit<Props, "view" | "emptyMessage">) {
  const [featured, ...rest] = items;
  if (!featured) return null;

  return (
    <div className="space-y-8">
      <Link href={contentHref(featured)}>
        <article className="group card-shine overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:shadow-[var(--shadow-glow)] dark:border-slate-800 dark:bg-slate-900">
          <ContentCover
            type={featured.type}
            title={featured.title}
            coverImage={featured.coverImage}
            className="h-56 md:h-80"
            overlay
          />
          <div className="p-6 md:p-10">
            <TypeBadge type={featured.type} />
            <h2 className="mt-4 text-2xl font-bold leading-tight transition-colors group-hover:text-violet-600 md:text-4xl dark:group-hover:text-violet-400">
              {featured.title}
            </h2>
            {featured.excerpt && (
              <p className="mt-4 line-clamp-3 text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                {featured.excerpt}
              </p>
            )}
            <MetaLine
              item={featured}
              showAuthor={showAuthor ?? true}
              showSpace={showSpace ?? true}
              showStats={showStats ?? true}
              className="mt-5 text-sm"
            />
          </div>
        </article>
      </Link>
      {rest.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((item) => (
            <GridCard
              key={item.id}
              item={item}
              showAuthor={showAuthor}
              showSpace={showSpace}
              showStats={showStats}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentFeed({
  items,
  view,
  emptyMessage = "Няма публикации.",
  showAuthor = true,
  showSpace = true,
  showStats = true,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 py-16 text-center dark:border-violet-900/50 dark:bg-violet-950/20">
        <p className="text-4xl">✨</p>
        <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  if (view === "magazine") {
    return (
      <MagazineLayout
        items={items}
        showAuthor={showAuthor}
        showSpace={showSpace}
        showStats={showStats}
      />
    );
  }

  if (view === "compact") {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <CompactRow key={item.id} item={item} showAuthor={showAuthor} showSpace={showSpace} />
        ))}
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <ListRow
            key={item.id}
            item={item}
            showAuthor={showAuthor}
            showSpace={showSpace}
            showStats={showStats}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <GridCard
          key={item.id}
          item={item}
          showAuthor={showAuthor}
          showSpace={showSpace}
          showStats={showStats}
        />
      ))}
    </div>
  );
}
