"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type NavItem = {
  id: number;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
};

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [form, setForm] = useState({ label: "", href: "" });

  const load = () => fetch("/api/admin/navigation").then((r) => r.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, order: items.length }),
    });
    setForm({ label: "", href: "" });
    load();
  };

  const toggle = async (item: NavItem) => {
    await fetch(`/api/admin/navigation/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Изтриване?")) return;
    await fetch(`/api/admin/navigation/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Навигация</h1>
        <p className="text-zinc-500">Управлявай линковете в header-а</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Нов линк</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2"><Label>Етикет</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required /></div>
              <div className="space-y-2"><Label>URL</Label><Input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="/spaces" required /></div>
              <Button type="submit" className="w-full">Добави</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-zinc-500">{item.href}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.isActive ? "success" : "outline"}>{item.isActive ? "Активен" : "Спрян"}</Badge>
                  <Button size="sm" variant="outline" onClick={() => toggle(item)}>
                    {item.isActive ? "Изключи" : "Включи"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>Изтрий</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
