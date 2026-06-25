"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageRenderer } from "@/components/community/page-renderer";
import HomeFeed from "./home-feed";

type Page = {
  id: number;
  title: string;
  blocks: Array<{ id: number; type: string; order: number; config: Record<string, unknown> }>;
};

export default function HomePage() {
  const [page, setPage] = useState<Page | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/pages/home")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPage(data))
      .catch(() => setPage(null));
  }, []);

  if (page === undefined) {
    return <div className="p-8 text-center text-zinc-500">Зареждане...</div>;
  }

  if (page?.blocks?.length) {
    return <PageRenderer blocks={page.blocks} />;
  }

  return <HomeFeed />;
}
