"use client";

import { useContext, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicFormFields } from "@/components/community/dynamic-form-fields";
import { ImageUpload } from "@/components/ui/image-upload";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { SPACE_LABEL } from "@/lib/space-labels";
import type { FieldType } from "@prisma/client";

type Space = { id: number; name: string; slug: string };
type FormDef = {
  name?: string;
  space?: { id: number; name: string } | null;
  fields: Array<{
    id: number;
    order: number;
    required: boolean;
    field: {
      id: number;
      key: string;
      label: string;
      description?: string | null;
      type: FieldType;
      options?: string[] | null;
    };
  }>;
};

export default function CreateContentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Зареждане...</div>}>
      <CreateContentForm />
    </Suspense>
  );
}

function CreateContentForm() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState<"POST" | "ARTICLE" | "EVENT">("POST");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [spaceId, setSpaceId] = useState<string>("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [form, setForm] = useState<FormDef | null>(null);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [coverImage, setCoverImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login?redirect=/create");
  }, [user, loading, router]);

  useEffect(() => {
    fetch("/api/spaces")
      .then((r) => r.json())
      .then((data: Array<Space & { canPost?: boolean }>) => {
        const postable = data.filter((s) => s.canPost !== false);
        setSpaces(postable);
        const spaceSlug = searchParams.get("space");
        if (spaceSlug) {
          const match = postable.find((s) => s.slug === spaceSlug);
          if (match) {
            setSpaceId(String(match.id));
          } else {
            fetch(`/api/spaces/${encodeURIComponent(spaceSlug)}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (data?.id && postable.some((s) => s.id === data.id)) {
                  setSpaceId(String(data.id));
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams({ type });
    if (spaceId) params.set("spaceId", spaceId);
    fetch(`/api/forms?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data?.fields ? data : null);
        setCustomFields({});
      });
  }, [type, spaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          excerpt,
          body,
          type,
          status: "PUBLISHED",
          spaceId: spaceId ? Number(spaceId) : null,
          eventStart: type === "EVENT" ? eventStart : undefined,
          eventEnd: type === "EVENT" ? eventEnd : undefined,
          eventLocation: type === "EVENT" ? eventLocation : undefined,
          coverImage: coverImage || undefined,
          customFields,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const content = await res.json();
      router.push(`/content/${content.slug || content.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-8 text-center text-zinc-500">Зареждане...</div>;
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Създай публикация</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2">
              {(["POST", "ARTICLE", "EVENT"] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType(t)}
                >
                  {CONTENT_TYPE_LABELS[t]}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Заглавие</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Кратко описание</Label>
              <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </div>

            <ImageUpload
              label="Корица / снимка"
              value={coverImage}
              onChange={setCoverImage}
            />

            <div className="space-y-2">
              <Label>{SPACE_LABEL.one}</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={spaceId}
                onChange={(e) => setSpaceId(e.target.value)}
              >
                <option value="">Без {SPACE_LABEL.oneLower}</option>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Съдържание</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={8} />
            </div>

            {type === "EVENT" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Начало</Label>
                    <Input type="datetime-local" value={eventStart} onChange={(e) => setEventStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Край</Label>
                    <Input type="datetime-local" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Локация</Label>
                  <Input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
                </div>
              </>
            )}

            {form?.fields && form.fields.length > 0 && (
              <div className="rounded-lg border border-dashed border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/20">
                <p className="mb-4 text-sm font-medium text-violet-700 dark:text-violet-300">
                  Персонализирани полета
                  {form.name ? ` — ${form.name}` : ""}
                  {form.space ? ` (${form.space.name})` : ""}
                </p>
                <DynamicFormFields
                  fields={form.fields}
                  values={customFields}
                  onChange={(key, value) => setCustomFields((prev) => ({ ...prev, [key]: value }))}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Публикуване..." : "Публикувай"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
