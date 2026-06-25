"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type Content = {
  id: number;
  title: string;
  slug: string;
  type: string;
  status: string;
  createdAt: string;
  author: { name: string };
};

export default function AdminContentPage() {
  const [contents, setContents] = useState<Content[]>([]);

  const load = () => fetch("/api/content?status=PUBLISHED")
    .then((r) => r.json())
    .then((published) =>
      fetch("/api/content?status=DRAFT")
        .then((r) => r.json())
        .then((drafts) => setContents([...published, ...drafts])),
    );

  useEffect(() => { load(); }, []);

  const archive = async (slug: string) => {
    await fetch(`/api/content/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ARCHIVED" }),
    });
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Съдържание</h1>
        <p className="text-zinc-500">Модерирай всички публикации</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Всички публикации</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {contents.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-zinc-500">{item.author.name} · {formatDate(item.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{CONTENT_TYPE_LABELS[item.type]}</Badge>
                <Badge variant={item.status === "PUBLISHED" ? "success" : "outline"}>{item.status}</Badge>
                {item.status !== "ARCHIVED" && (
                  <Button size="sm" variant="outline" onClick={() => archive(item.slug)}>Архивирай</Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
