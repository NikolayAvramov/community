"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/community/page-header";
import { SPACE_LABEL } from "@/lib/space-labels";
import { SiteSearch } from "@/components/community/site-search";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { FileText, Folder, User } from "lucide-react";

type SearchResults = {
  contents: Array<{ id: number; title: string; slug: string; type: string; excerpt?: string | null; space?: { name: string } | null }>;
  spaces: Array<{ id: number; name: string; slug: string; description?: string | null }>;
  users: Array<{ id: number; name: string; bio?: string | null }>;
  pages: Array<{ id: number; title: string; slug: string }>;
};

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}&limit=20`)
      .then((r) => r.json())
      .then(setResults)
      .catch(() => setResults({ contents: [], spaces: [], users: [], pages: [] }))
      .finally(() => setLoading(false));
  }, [q]);

  const total =
    (results?.contents.length ?? 0) +
    (results?.spaces.length ?? 0) +
    (results?.users.length ?? 0) +
    (results?.pages.length ?? 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader title="Търсене" description={`Намерете съдържание, ${SPACE_LABEL.manyLower} и мембъри`} />
      <SiteSearch className="mb-8" />

      {!q && <p className="text-sm text-slate-500">Въведете поне 2 символа за търсене.</p>}
      {q && loading && <p className="text-sm text-slate-500">Търсене...</p>}
      {q && !loading && results && total === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-slate-500">
            Няма резултати за „{q}"
          </CardContent>
        </Card>
      )}

      {q && !loading && results && total > 0 && (
        <div className="space-y-8">
          {results.contents.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Съдържание</h2>
              <div className="space-y-2">
                {results.contents.map((item) => (
                  <Link key={item.id} href={`/content/${item.slug}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-start gap-3 py-4">
                        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.excerpt && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.excerpt}</p>}
                          <div className="mt-2 flex gap-2">
                            <Badge variant="secondary">{CONTENT_TYPE_LABELS[item.type] ?? item.type}</Badge>
                            {item.space && <span className="text-xs text-slate-400">{item.space.name}</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.spaces.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">{SPACE_LABEL.many}</h2>
              <div className="space-y-2">
                {results.spaces.map((item) => (
                  <Link key={item.id} href={`/spaces/${item.slug}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-3 py-4">
                        <Folder className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.users.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Мембъри</h2>
              <div className="space-y-2">
                {results.users.map((item) => (
                  <Link key={item.id} href={`/members/${item.id}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-3 py-4">
                        <User className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.bio && <p className="text-sm text-slate-500">{item.bio}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.pages.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Страници</h2>
              <div className="space-y-2">
                {results.pages.map((item) => (
                  <Link key={item.id} href={`/${item.slug}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-3 py-4">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <p className="font-medium">{item.title}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
