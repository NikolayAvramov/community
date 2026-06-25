"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPageUrl } from "@/lib/page-blocks";

type Page = { id: number; title: string; slug: string; isHome: boolean; published: boolean; _count: { blocks: number } };

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(true);

  const load = () => fetch("/api/admin/pages").then((r) => r.json()).then(setPages);
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, published }),
    });
    setTitle("");
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Page Builder</h1>
        <p className="text-zinc-500">Създавай страници с блокове</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Нова страница</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label>Заглавие</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                Публикувай веднага
              </label>
              <Button type="submit" className="w-full">Създай</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{page.title}</p>
                  <p className="text-sm text-zinc-500">{getPageUrl(page)} · {page._count.blocks} блока</p>
                  <div className="mt-1 flex gap-2">
                    {page.isHome && <Badge>Начална</Badge>}
                    <Badge variant={page.published ? "success" : "outline"}>{page.published ? "Публикувана" : "Чернова"}</Badge>
                  </div>
                </div>
                <Link href={`/admin/pages/${page.id}`}>
                  <Button size="sm">Редактирай</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
