"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSpaceGradient } from "@/lib/content-visuals";
import { SPACE_LABEL } from "@/lib/space-labels";
import { ArrowRight } from "lucide-react";

type Space = {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  _count?: { contents: number };
};

export function SpacesStrip() {
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    fetch("/api/spaces")
      .then((r) => r.json())
      .then((data) => setSpaces(Array.isArray(data) ? data.slice(0, 8) : []));
  }, []);

  if (spaces.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Открий
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{SPACE_LABEL.many}</h2>
        </div>
        <Link
          href="/spaces"
          className="flex items-center gap-1 text-sm font-medium text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400"
        >
          Всички
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {spaces.map((space) => (
          <Link
            key={space.id}
            href={`/spaces/${space.slug}`}
            className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] dark:border-slate-800 dark:bg-slate-900"
          >
            <div
              className={`relative flex h-20 items-center justify-center bg-gradient-to-br ${getSpaceGradient(space.slug)}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
              <span className="relative text-3xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">
                {space.icon ?? "📁"}
              </span>
            </div>
            <div className="p-3">
              <p className="truncate font-semibold text-slate-900 dark:text-slate-50">{space.name}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {space._count?.contents ?? 0} публикации
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
