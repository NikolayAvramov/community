"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
import { PLACEMENT_LABELS } from "@/lib/constants";
import { SPACE_LABEL } from "@/lib/space-labels";

type SpaceOption = { id: number; name: string; slug: string };

type Banner = {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  placement: string;
  spaceId?: number | null;
  space?: SpaceOption | null;
  isActive: boolean;
  order: number;
};

const emptyForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  linkText: "",
  placement: "home",
  spaceId: "" as string | number,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [spaces, setSpaces] = useState<SpaceOption[]>([]);
  const [form, setForm] = useState(emptyForm);

  const load = () => fetch("/api/admin/banners").then((r) => r.json()).then(setBanners);
  useEffect(() => {
    load();
    fetch("/api/spaces")
      .then((r) => r.json())
      .then((data) => setSpaces(Array.isArray(data) ? data : []));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.placement === "space" && !form.spaceId) {
      alert(`Изберете ${SPACE_LABEL.oneLower}.`);
      return;
    }
    await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        spaceId: form.placement === "space" ? Number(form.spaceId) : null,
      }),
    });
    setForm(emptyForm);
    load();
  };

  const updateImage = async (banner: Banner, imageUrl: string) => {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    load();
  };

  const toggle = async (banner: Banner) => {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Изтриване?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Банери</h1>
        <p className="text-zinc-500">Управлявай hero банери за началната страница и отделни секции</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Нов банер</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2"><Label>Заглавие</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Подзаглавие</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
              <ImageUpload
                label="Фоново изображение"
                value={form.imageUrl}
                onChange={(imageUrl) => setForm({ ...form, imageUrl })}
              />
              <div className="space-y-2"><Label>Линк URL</Label><Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} /></div>
              <div className="space-y-2"><Label>Текст на бутона</Label><Input value={form.linkText} onChange={(e) => setForm({ ...form, linkText: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Позиция</Label>
                <select
                  className="flex h-10 w-full rounded-lg border px-3 text-sm"
                  value={form.placement}
                  onChange={(e) => setForm({ ...form, placement: e.target.value, spaceId: "" })}
                >
                  {Object.entries(PLACEMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {form.placement === "space" && (
                <div className="space-y-2">
                  <Label>{SPACE_LABEL.one}</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border px-3 text-sm"
                    value={form.spaceId}
                    onChange={(e) => setForm({ ...form, spaceId: e.target.value })}
                    required
                  >
                    <option value="">Изберете {SPACE_LABEL.oneLower}…</option>
                    {spaces.map((space) => (
                      <option key={space.id} value={space.id}>{space.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <Button type="submit" className="w-full">Създай банер</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {banners.map((banner) => (
            <Card key={banner.id}>
              <CardContent className="py-4">
                <div className="flex gap-4">
                  {banner.imageUrl && (
                    <img src={banner.imageUrl} alt="" className="h-20 w-32 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{banner.title}</p>
                      <p className="text-sm text-zinc-500">{banner.subtitle}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="outline">{PLACEMENT_LABELS[banner.placement]}</Badge>
                        {banner.space && (
                          <Badge variant="secondary">{banner.space.name}</Badge>
                        )}
                        <Badge variant={banner.isActive ? "success" : "secondary"}>{banner.isActive ? "Активен" : "Спрян"}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggle(banner)}>
                        {banner.isActive ? "Изключи" : "Включи"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(banner.id)}>Изтрий</Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <ImageUpload
                    label="Смени изображение"
                    value={banner.imageUrl ?? ""}
                    onChange={(imageUrl) => updateImage(banner, imageUrl)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
