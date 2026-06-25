"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SPACE_ACCESS_LABELS, SPACE_LABEL } from "@/lib/space-labels";
import { normalizeSlug } from "@/lib/utils";
import { Copy, Trash2 } from "lucide-react";

type SpaceDetail = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  accessMode: "PUBLIC" | "MEMBERS" | "RESTRICTED";
  allowMemberPosts: boolean;
  members: Array<{ id: number; user: { id: number; name: string; email: string } }>;
  invitations: Array<{ id: number; email: string; token: string; createdAt: string }>;
  _count: { contents: number; members: number };
};

export default function AdminSpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<SpaceDetail | null>(null);
  const [saved, setSaved] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch(`/api/admin/spaces/${id}`)
      .then((r) => r.json())
      .then(setSpace);

  useEffect(() => {
    load();
  }, [id]);

  const save = async () => {
    if (!space) return;
    setError(null);
    const res = await fetch(`/api/admin/spaces/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: space.name,
        slug: space.slug,
        description: space.description,
        icon: space.icon,
        accessMode: space.accessMode,
        allowMemberPosts: space.allowMemberPosts,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Грешка при запазване");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/admin/spaces/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: memberEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Грешка");
      return;
    }
    setMemberEmail("");
    load();
  };

  const removeMember = async (userId: number) => {
    if (!confirm("Премахване на мембъра от секцията?")) return;
    await fetch(`/api/admin/spaces/${id}/members?userId=${userId}`, { method: "DELETE" });
    load();
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInviteUrl(null);
    const res = await fetch(`/api/admin/spaces/${id}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Грешка");
      return;
    }
    setInviteUrl(data.inviteUrl ?? null);
    setInviteEmail("");
    load();
  };

  const revokeInvite = async (invitationId: number) => {
    await fetch(`/api/admin/spaces/${id}/invitations?invitationId=${invitationId}`, { method: "DELETE" });
    load();
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!space) return <p className="text-zinc-500">Зареждане...</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/spaces" className="text-sm text-indigo-600 hover:underline">
            ← {SPACE_LABEL.many}
          </Link>
          <h1 className="text-3xl font-bold">{space.name}</h1>
          <p className="text-sm text-zinc-500">/{space.slug}</p>
        </div>
        <Button onClick={save}>{saved ? "Запазено ✓" : "Запази"}</Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Основни настройки</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Име</Label>
              <Input value={space.name} onChange={(e) => setSpace({ ...space, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={space.slug}
                onChange={(e) => setSpace({ ...space, slug: e.target.value })}
                onBlur={(e) => setSpace({ ...space, slug: normalizeSlug(e.target.value) })}
              />
              <p className="text-xs text-zinc-400">Само латински букви, цифри и тире. Кирилицата се преобразува автоматично.</p>
            </div>
            <div className="space-y-2">
              <Label>Икона</Label>
              <Input value={space.icon ?? ""} onChange={(e) => setSpace({ ...space, icon: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea value={space.description ?? ""} onChange={(e) => setSpace({ ...space, description: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Достъп и публикуване</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Кой вижда {SPACE_LABEL.oneAcc}</Label>
              <select
                className="flex h-10 w-full rounded-lg border px-3 text-sm"
                value={space.accessMode}
                onChange={(e) =>
                  setSpace({ ...space, accessMode: e.target.value as SpaceDetail["accessMode"] })
                }
              >
                {Object.entries(SPACE_ACCESS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={space.allowMemberPosts}
                onChange={(e) => setSpace({ ...space, allowMemberPosts: e.target.checked })}
              />
              Мембърите могат да публикуват
            </label>
            {!space.allowMemberPosts && (
              <p className="text-xs text-amber-600">
                Само четене за мембърите — публикуват само администратори.
              </p>
            )}

            {space.accessMode === "RESTRICTED" && (
              <p className="text-xs text-slate-500">
                Затворена секция — достъп само за добавени мембъри или поканени по имейл.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {space.accessMode === "RESTRICTED" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Мембъри в секцията</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addMember} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="имейл@example.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
                <Button type="submit">Добави</Button>
              </form>
              <div className="space-y-2">
                {space.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div>
                      <p className="font-medium">{m.user.name}</p>
                      <p className="text-xs text-slate-500">{m.user.email}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeMember(m.user.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {space.members.length === 0 && (
                  <p className="text-sm text-slate-500">Няма добавени мембъри.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Покани по имейл</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={sendInvite} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="имейл@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <Button type="submit">Изпрати</Button>
              </form>

              {inviteUrl && (
                <div className="flex gap-2">
                  <Input readOnly value={inviteUrl} className="text-xs" />
                  <Button type="button" variant="outline" onClick={copyInvite} className="gap-1">
                    <Copy className="h-4 w-4" />
                    {copied ? "Копирано" : "Копирай"}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                {space.invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{inv.email}</p>
                      <Badge variant="outline" className="mt-1">Чакаща</Badge>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => revokeInvite(inv.id)}>
                      Отмени
                    </Button>
                  </div>
                ))}
                {space.invitations.length === 0 && (
                  <p className="text-sm text-slate-500">Няма активни покани.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
