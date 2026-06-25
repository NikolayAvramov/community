"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SPACE_ACCESS_LABELS, SPACE_LABEL } from "@/lib/space-labels";

type Space = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  accessMode: string;
  allowMemberPosts: boolean;
  _count: { contents: number; members: number };
};

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "📁",
    accessMode: "PUBLIC" as const,
    allowMemberPosts: true,
  });

  const load = () => fetch("/api/admin/spaces").then((r) => r.json()).then(setSpaces);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "", icon: "📁", accessMode: "PUBLIC", allowMemberPosts: true });
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{SPACE_LABEL.many}</h1>
        <p className="text-zinc-500">Организирай съдържанието в тематични {SPACE_LABEL.manyLower}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Нова {SPACE_LABEL.oneLower}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Име</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Икона (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
              <div className="space-y-2"><Label>Описание</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Достъп</Label>
                <select
                  className="flex h-10 w-full rounded-lg border px-3 text-sm"
                  value={form.accessMode}
                  onChange={(e) => setForm({ ...form, accessMode: e.target.value as "PUBLIC" })}
                >
                  {Object.entries(SPACE_ACCESS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.allowMemberPosts} onChange={(e) => setForm({ ...form, allowMemberPosts: e.target.checked })} />
                Мембърите могат да публикуват
              </label>
              <Button type="submit" className="w-full">Създай</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {spaces.map((space) => (
            <Link key={space.id} href={`/admin/spaces/${space.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{space.icon}</span>
                    <div>
                      <p className="font-medium">{space.name}</p>
                      <p className="text-sm text-zinc-500">/{space.slug}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="outline">{SPACE_ACCESS_LABELS[space.accessMode] ?? space.accessMode}</Badge>
                        {!space.allowMemberPosts && <Badge variant="secondary">Само четене</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-zinc-500">
                    <p>{space._count.contents} публикации</p>
                    {space.accessMode === "RESTRICTED" && <p>{space._count.members} мембъри</p>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
