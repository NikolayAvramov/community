"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthContext } from "@/app/context/AuthContext";
import { ContentFeedSection } from "@/components/community/content-feed-section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { resolveCtaForUser } from "@/lib/auth-ui";
import type { ContentListItem, ContentViewMode } from "@/lib/content-views";
import { isContentViewMode } from "@/lib/content-views";
import { SPACE_LABEL } from "@/lib/space-labels";
import { ArrowRight } from "lucide-react";

type Block = { id: number; type: string; order: number; config: Record<string, unknown> };

type Space = { id: number; name: string; slug: string; description?: string; icon?: string };

function buildPostsUrl(config: Record<string, unknown>): string {
  const params = new URLSearchParams({ status: "PUBLISHED" });
  if (config.spaceId) params.set("spaceId", String(config.spaceId));
  const postIds = config.postIds as number[] | undefined;
  if (postIds?.length) params.set("ids", postIds.join(","));
  if (config.limit) params.set("limit", String(config.limit));
  return `/api/content?${params}`;
}

function getViewFromConfig(config: Record<string, unknown>): ContentViewMode {
  const view = String(config.view ?? "grid");
  return isContentViewMode(view) ? view : "grid";
}

function HeroBlock({ config }: { config: Record<string, unknown> }) {
  const { user } = useContext(AuthContext);
  const cta = resolveCtaForUser(
    user,
    config.buttonUrl ? String(config.buttonUrl) : null,
    config.buttonText ? String(config.buttonText) : null,
  );

  return (
    <section className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-8 shadow-lg shadow-indigo-900/20 md:p-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
          {String(config.title ?? "")}
        </h1>
        {config.subtitle ? (
          <p className="mt-4 text-lg leading-relaxed text-indigo-100/90 md:text-xl">{String(config.subtitle)}</p>
        ) : null}
        {cta.url && cta.text ? (
          <Link href={cta.url}>
            <Button className="mt-8 bg-white text-indigo-700 shadow-md hover:bg-indigo-50">
              {cta.text} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function TextBlock({ config }: { config: Record<string, unknown> }) {
  return (
    <div className="mb-8">
      {config.title ? (
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {String(config.title)}
        </h2>
      ) : null}
      <p className="prose-content whitespace-pre-wrap">{String(config.body ?? "")}</p>
    </div>
  );
}

function PostsContentBlock({
  config,
  requireSpace,
  emptyText,
}: {
  config: Record<string, unknown>;
  requireSpace?: boolean;
  emptyText: string;
}) {
  const [posts, setPosts] = useState<ContentListItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const spaceId = config.spaceId ? Number(config.spaceId) : null;
  const postIds = (config.postIds as number[]) ?? [];
  const limit = Number(config.limit) || 6;
  const defaultView = getViewFromConfig(config);

  useEffect(() => {
    if (requireSpace && !spaceId) {
      setPosts([]);
      setLoaded(true);
      return;
    }
    fetch(buildPostsUrl({ spaceId, postIds, limit }))
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setPosts(Array.isArray(d) ? d.slice(0, limit) : []))
      .catch(() => setPosts([]))
      .finally(() => setLoaded(true));
  }, [spaceId, postIds.join(","), limit, requireSpace]);

  if (requireSpace && !spaceId) {
    return <p className="mb-8 text-sm text-zinc-500">Избери {SPACE_LABEL.oneLower} в админ редактора.</p>;
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">{String(config.title ?? "Публикации")}</h2>
      {!loaded ? (
        <p className="text-zinc-500">Зареждане...</p>
      ) : (
        <ContentFeedSection
          items={posts}
          defaultView={defaultView}
          emptyMessage={emptyText}
          showSpace={!spaceId}
        />
      )}
    </div>
  );
}

function PostsBlock({ config }: { config: Record<string, unknown> }) {
  return (
    <PostsContentBlock
      config={config}
      emptyText="Все още няма публикации."
    />
  );
}

function SpacePostsBlock({ config }: { config: Record<string, unknown> }) {
  return (
    <PostsContentBlock
      config={config}
      requireSpace
      emptyText={`Няма публикации в тази ${SPACE_LABEL.oneLower}.`}
    />
  );
}

function SpacesBlock() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  useEffect(() => {
    fetch("/api/spaces")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSpaces(Array.isArray(d) ? d : []))
      .catch(() => setSpaces([]));
  }, []);

  return (
    <div className="mb-8">
      <h2 className="mb-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{SPACE_LABEL.many}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {spaces.map((space) => (
          <Link key={space.id} href={`/spaces/${space.slug}`}>
            <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
              <CardContent className="flex items-center gap-4 py-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
                  {space.icon ?? "📁"}
                </span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">{space.name}</p>
                  {space.description && <p className="text-sm text-slate-500">{space.description}</p>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CtaBlock({ config }: { config: Record<string, unknown> }) {
  const { user } = useContext(AuthContext);
  const cta = resolveCtaForUser(
    user,
    config.buttonUrl ? String(config.buttonUrl) : null,
    config.buttonText ? String(config.buttonText) : null,
  );

  return (
    <section className="mb-8 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white p-8 text-center shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-slate-950">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        {String(config.title ?? (user ? "Добре дошъл отново" : "Присъедини се"))}
      </h2>
      {config.subtitle ? <p className="mt-2 text-slate-600 dark:text-slate-400">{String(config.subtitle)}</p> : null}
      {cta.url ? (
        <Link href={cta.url}>
          <Button className="mt-4">{cta.text ?? "Започни"}</Button>
        </Link>
      ) : null}
    </section>
  );
}

export function PageRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {blocks.map((block) => {
        const config = (block.config ?? {}) as Record<string, unknown>;
        switch (block.type) {
          case "hero": return <HeroBlock key={block.id} config={config} />;
          case "text": return <TextBlock key={block.id} config={config} />;
          case "posts": return <PostsBlock key={block.id} config={config} />;
          case "space_posts": return <SpacePostsBlock key={block.id} config={config} />;
          case "spaces": return <SpacesBlock key={block.id} />;
          case "cta": return <CtaBlock key={block.id} config={config} />;
          default: return null;
        }
      })}
    </div>
  );
}
