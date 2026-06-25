"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/community/page-header";
import { Badge } from "@/components/ui/badge";
import { getSpaceGradient } from "@/lib/content-visuals";
import { SPACE_ACCESS_LABELS, SPACE_LABEL } from "@/lib/space-labels";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Space = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  accessMode: string;
  allowMemberPosts: boolean;
  canPost?: boolean;
  collection?: { name: string };
  _count: { contents: number };
};

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    fetch("/api/spaces").then((r) => r.json()).then(setSpaces);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title={SPACE_LABEL.many}
        description={`Разгледай тематичните ${SPACE_LABEL.manyLower} на общността — всяка със свой характер и съдържание`}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space) => (
          <Link key={space.id} href={`/spaces/${space.slug}`}>
            <article className="group card-shine flex h-full flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] dark:border-slate-800 dark:bg-slate-900">
              <div
                className={cn(
                  "relative flex h-32 items-center justify-center bg-gradient-to-br",
                  getSpaceGradient(space.slug),
                )}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.35),transparent_50%)]" />
                <span className="relative text-5xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                  {space.icon ?? "📁"}
                </span>
                <div className="absolute bottom-3 right-3 rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  {space._count.contents} публикации
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-violet-600 dark:text-slate-50 dark:group-hover:text-violet-400">
                  {space.name}
                </h3>
                {space.collection && (
                  <Badge variant="outline" className="mt-2 w-fit">{space.collection.name}</Badge>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {space.accessMode !== "PUBLIC" && (
                    <Badge variant="secondary">{SPACE_ACCESS_LABELS[space.accessMode]}</Badge>
                  )}
                  {!space.allowMemberPosts && <Badge variant="outline">Само четене</Badge>}
                </div>
                {space.description && (
                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">{space.description}</p>
                )}
                <span className="mt-4 flex items-center gap-1 text-sm font-medium text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-violet-400">
                  Влез в секцията
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
