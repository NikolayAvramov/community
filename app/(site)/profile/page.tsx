"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Profile = {
  name: string;
  email: string;
  bio?: string | null;
  avatar?: string | null;
};

export default function ProfileSettingsPage() {
  const { user, loading, refresh } = useContext(AuthContext);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirect=/profile");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/users/me", { credentials: "include" })
        .then((r) => r.json())
        .then(setProfile);
    }
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        await refresh();
        setMessage("Профилът е запазен.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-lg px-4 py-8 text-center text-zinc-500">Зареждане...</div>;
  }

  if (!user || !profile) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Настройки на профила</CardTitle>
        </CardHeader>
        <CardContent>
          {message && <p className="mb-4 text-sm text-emerald-600">{message}</p>}
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label>Име</Label>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Имейл</Label>
              <Input value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Био</Label>
              <Textarea value={profile.bio ?? ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Аватар URL</Label>
              <Input value={profile.avatar ?? ""} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} placeholder="https://..." />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Запазване..." : "Запази"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
