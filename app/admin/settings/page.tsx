"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { Badge } from "@/components/ui/badge";
import { Copy, Headphones, ShieldOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Settings = {
  siteName: string;
  siteDescription?: string;
  primaryColor?: string;
  logoUrl?: string;
  allowRegistration?: boolean;
};

type SupportAccess = {
  enabled: boolean;
  enabledAt: string | null;
  expiresAt: string | null;
  accessUrl: string | null;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [supportAccess, setSupportAccess] = useState<SupportAccess | null>(null);
  const [saved, setSaved] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadSupport = () =>
    fetch("/api/admin/support-access")
      .then((r) => r.json())
      .then(setSupportAccess);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
    loadSupport();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enableSupport = async () => {
    setSupportLoading(true);
    try {
      const res = await fetch("/api/admin/support-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable" }),
      });
      setSupportAccess(await res.json());
    } finally {
      setSupportLoading(false);
    }
  };

  const disableSupport = async () => {
    if (!confirm("Сигурни ли сте? Активните сесии на поддръжката ще бъдат прекратени.")) return;
    setSupportLoading(true);
    try {
      const res = await fetch("/api/admin/support-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      setSupportAccess(await res.json());
    } finally {
      setSupportLoading(false);
    }
  };

  const copyLink = async () => {
    if (!supportAccess?.accessUrl) return;
    await navigator.clipboard.writeText(supportAccess.accessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!settings) return <p className="text-zinc-500">Зареждане...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-zinc-500">Брандинг и глобални настройки на общността</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Достъп за поддръжка
          </CardTitle>
          <CardDescription>
            Временно дайте достъп на екипа по поддръжка до администрацията. Линкът е валиден 7 дни.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {supportAccess && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Статус:</span>
                <Badge variant={supportAccess.enabled ? "success" : "outline"}>
                  {supportAccess.enabled ? "Активен" : "Изключен"}
                </Badge>
              </div>

              {supportAccess.enabled && supportAccess.expiresAt && (
                <p className="text-sm text-slate-500">
                  Изтича на: {formatDate(supportAccess.expiresAt)}
                </p>
              )}

              {supportAccess.enabled && supportAccess.accessUrl && (
                <div className="space-y-2">
                  <Label>Линк за поддръжка</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={supportAccess.accessUrl} className="font-mono text-xs" />
                    <Button type="button" variant="outline" onClick={copyLink} className="shrink-0 gap-1.5">
                      <Copy className="h-4 w-4" />
                      {copied ? "Копирано" : "Копирай"}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Изпратете този линк на екипа по поддръжка. След отваряне получават достъп до CMS.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {!supportAccess.enabled ? (
                  <Button type="button" onClick={enableSupport} disabled={supportLoading}>
                    {supportLoading ? "..." : "Включи достъп за поддръжка"}
                  </Button>
                ) : (
                  <Button type="button" variant="destructive" onClick={disableSupport} disabled={supportLoading} className="gap-1.5">
                    <ShieldOff className="h-4 w-4" />
                    {supportLoading ? "..." : "Изключи достъп за поддръжка"}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Брандинг</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={save} className="max-w-lg space-y-6">
            <div className="space-y-2">
              <Label>Име на общността</Label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={settings.siteDescription ?? ""}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
              />
            </div>

            <ImageUpload
              label="Лого"
              hint="Показва се в header-а до името"
              value={settings.logoUrl ?? ""}
              onChange={(logoUrl) => setSettings({ ...settings, logoUrl })}
            />

            <div className="space-y-2">
              <Label>Основен цвят</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="h-10 w-16 p-1"
                  value={settings.primaryColor ?? "#7c3aed"}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                />
                <Input
                  value={settings.primaryColor ?? "#7c3aed"}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.allowRegistration ?? true}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
              />
              Разрешена регистрация
            </label>

            <Button type="submit">{saved ? "Запазено ✓" : "Запази настройките"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
