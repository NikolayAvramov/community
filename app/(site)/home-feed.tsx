"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ContentFeedSection } from "@/components/community/content-feed-section";
import { BannerList, type BannerItem } from "@/components/community/banner-list";
import { SpacesStrip } from "@/components/community/spaces-strip";
import { PageHeader } from "@/components/community/page-header";
import { Button } from "@/components/ui/button";
import type { ContentListItem } from "@/lib/content-views";
import { FileText, Users, Layers } from "lucide-react";

export default function HomeFeed() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [contents, setContents] = useState<ContentListItem[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [spaceCount, setSpaceCount] = useState(0);

  useEffect(() => {
    fetch("/api/banners?placement=home")
      .then((r) => r.json())
      .then((data) => setBanners(Array.isArray(data) ? data : []));
    fetch("/api/content?status=PUBLISHED")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setContents(Array.isArray(data) ? data : []))
      .catch(() => setContents([]));
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setMemberCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
    fetch("/api/spaces")
      .then((r) => r.json())
      .then((data) => setSpaceCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, []);

  const stats = [
    { label: "Публикации", value: contents.length, icon: FileText, color: "text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300" },
    { label: "Мембъри", value: memberCount, icon: Users, color: "text-sky-600 bg-sky-100 dark:bg-sky-500/15 dark:text-sky-300" },
    { label: "Секции", value: spaceCount, icon: Layers, color: "text-orange-600 bg-orange-100 dark:bg-orange-500/15 dark:text-orange-300" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <BannerList banners={banners} />

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/80 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <SpacesStrip />

      <PageHeader
        title="Последно съдържание"
        description="Постове, статии и събития от общността"
        action={
          <Link href="/create">
            <Button size="lg" className="shadow-[var(--shadow-glow)]">Създай публикация</Button>
          </Link>
        }
      />

      <ContentFeedSection
        items={contents}
        defaultView="magazine"
        storageKey="content-view-home"
        emptyMessage="Все още няма публикации. Бъдете първият!"
      />
    </div>
  );
}
