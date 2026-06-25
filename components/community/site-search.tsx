"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { SPACE_LABEL } from "@/lib/space-labels";
import { FileText, Folder, Search, User, X } from "lucide-react";

type SearchResults = {
  contents: Array<{ id: number; title: string; slug: string; type: string; excerpt?: string | null; space?: { name: string } | null }>;
  spaces: Array<{ id: number; name: string; slug: string }>;
  users: Array<{ id: number; name: string }>;
  pages: Array<{ id: number; title: string; slug: string }>;
};

type Props = {
  className?: string;
  compact?: boolean;
};

export function SiteSearch({ className, compact }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const hasResults =
    results &&
    (results.contents.length > 0 ||
      results.spaces.length > 0 ||
      results.users.length > 0 ||
      results.pages.length > 0);

  function goToSearch(q?: string) {
    const term = (q ?? query).trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              goToSearch();
            }
            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={compact ? "Търси..." : `Търси съдържание, ${SPACE_LABEL.manyLower}, мембъри...`}
          className={cn("h-9 pl-9 pr-8", compact ? "text-sm" : "")}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
          {loading && <p className="px-4 py-3 text-sm text-slate-500">Търсене...</p>}
          {!loading && !hasResults && (
            <p className="px-4 py-3 text-sm text-slate-500">Няма резултати за „{query}"</p>
          )}
          {!loading && hasResults && (
            <div className="max-h-80 overflow-y-auto py-1">
              {results!.contents.map((item) => (
                <Link
                  key={`c-${item.id}`}
                  href={`/content/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {CONTENT_TYPE_LABELS[item.type] ?? item.type}
                      {item.space ? ` · ${item.space.name}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
              {results!.spaces.map((item) => (
                <Link
                  key={`s-${item.id}`}
                  href={`/spaces/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <Folder className="h-4 w-4 shrink-0 text-slate-400" />
                  <p className="truncate text-sm font-medium">{item.name}</p>
                </Link>
              ))}
              {results!.users.map((item) => (
                <Link
                  key={`u-${item.id}`}
                  href={`/members/${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <User className="h-4 w-4 shrink-0 text-slate-400" />
                  <p className="truncate text-sm font-medium">{item.name}</p>
                </Link>
              ))}
              {results!.pages.map((item) => (
                <Link
                  key={`p-${item.id}`}
                  href={`/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <p className="truncate text-sm font-medium">{item.title}</p>
                </Link>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => goToSearch()}
            className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-medium text-indigo-600 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
          >
            Виж всички резултати
          </button>
        </div>
      )}
    </div>
  );
}
