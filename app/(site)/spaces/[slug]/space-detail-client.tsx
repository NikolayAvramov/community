"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ContentFeedSection } from "@/components/community/content-feed-section";
import { BannerList, type BannerItem } from "@/components/community/banner-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSpaceGradient } from "@/lib/content-visuals";
import { SPACE_ACCESS_LABELS, SPACE_LABEL } from "@/lib/space-labels";
import type { ContentListItem } from "@/lib/content-views";
import { cn } from "@/lib/utils";

type Space = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  accessMode: string;
  allowMemberPosts: boolean;
  canPost?: boolean;
};

export function SpaceDetailClient({ slug }: { slug: string }) {
  const [contents, setContents] = useState<ContentListItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [space, setSpace] = useState<Space | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch(`/api/spaces/${slug}`)
      .then(async (r) => {
        if (!r.ok) {
          setDenied(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setSpace(data);
      });

    fetch(`/api/content?status=PUBLISHED&spaceSlug=${slug}`)
      .then((r) => r.json())
      .then(setContents);

    fetch(`/api/banners?spaceSlug=${slug}`)
      .then((r) => r.json())
      .then((data) => setBanners(Array.isArray(data) ? data : []));
  }, [slug]);

  if (denied) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl">
          🔒
        </div>
        <h1 className="text-xl font-bold">Нямате достъп до тази {SPACE_LABEL.oneLower}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Тя е затворена. Поискайте покана от администратор.
        </p>
        <Link href="/spaces" className="mt-6 inline-block">
          <Button variant="outline">Към {SPACE_LABEL.manyLower}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <BannerList banners={banners} />

      <div
        className={cn(
          "relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br p-8 md:p-10",
          getSpaceGradient(slug),
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="blob -right-8 -top-8 h-40 w-40 bg-white/20" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl backdrop-blur-sm">
              {space?.icon ?? "📁"}
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{space?.name ?? slug}</h1>
              {space?.description && (
                <p className="mt-2 max-w-xl text-white/85">{space.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {space && space.accessMode !== "PUBLIC" && (
                  <Badge className="bg-white/20 text-white ring-white/30">{SPACE_ACCESS_LABELS[space.accessMode]}</Badge>
                )}
                {space && !space.allowMemberPosts && (
                  <Badge className="bg-white/20 text-white ring-white/30">Само четене</Badge>
                )}
              </div>
            </div>
          </div>
          {space?.canPost && (
            <Link href={`/create?space=${slug}`}>
              <Button className="bg-white font-semibold text-violet-700 shadow-lg hover:bg-violet-50">
                + Нова публикация
              </Button>
            </Link>
          )}
          {space && !space.canPost && space.allowMemberPosts === false && (
            <p className="text-sm text-white/70">Публикуването е ограничено от администратор.</p>
          )}
        </div>
      </div>

      <ContentFeedSection
        items={contents}
        defaultView="grid"
        storageKey={`content-view-space-${slug}`}
        emptyMessage={`Няма публикации в тази ${SPACE_LABEL.oneLower}.`}
        showSpace={false}
      />
    </div>
  );
}
