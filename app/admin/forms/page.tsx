"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { fetchJson } from "@/lib/fetch-client";

type Field = { id: number; key: string; label: string; entityType: string };
type Space = { id: number; name: string; slug: string };
type FormDef = {
  id: number;
  name: string;
  slug: string;
  contentType?: string | null;
  space?: Space | null;
  fields: Array<{ field: Field; required: boolean }>;
};

export default function AdminFormsPage() {
  const [forms, setForms] = useState<FormDef[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [name, setName] = useState("");
  const [contentType, setContentType] = useState<"" | "POST" | "ARTICLE" | "EVENT">("");
  const [spaceId, setSpaceId] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);

    const [formsRes, fieldsRes, spacesRes] = await Promise.all([
      fetchJson<FormDef[]>("/api/admin/forms"),
      fetchJson<Field[]>("/api/admin/fields"),
      fetchJson<Space[]>("/api/admin/spaces"),
    ]);

    const errors = [formsRes.error, fieldsRes.error, spacesRes.error].filter(Boolean);
    if (errors.length > 0) {
      setError(errors.join(" · "));
    }

    setForms(Array.isArray(formsRes.data) ? formsRes.data : []);
    setFields(Array.isArray(fieldsRes.data) ? fieldsRes.data : []);
    setSpaces(Array.isArray(spacesRes.data) ? spacesRes.data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error: createError } = await fetchJson("/api/admin/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        entityType: "content",
        contentType: contentType || undefined,
        spaceId: spaceId ? Number(spaceId) : null,
        fieldIds: selectedFields.map((fieldId, i) => ({ fieldId, order: i, required: false })),
      }),
    });

    if (createError) {
      setError(createError);
      return;
    }

    setName("");
    setContentType("");
    setSpaceId("");
    setSelectedFields([]);
    load();
  };

  const contentFields = fields.filter((f) => f.entityType === "content");

  const scopeLabel = (form: FormDef) => {
    if (form.space && form.contentType) return `${form.space.name} · ${CONTENT_TYPE_LABELS[form.contentType]}`;
    if (form.space) return form.space.name;
    if (form.contentType) return CONTENT_TYPE_LABELS[form.contentType];
    return "Глобална";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Конструктор на форми</h1>
        <p className="text-zinc-500">
          Създавай форми за конкретно пространство, тип съдържание или и двете.
          Приоритет: пространство+тип → само пространство → глобален тип.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500">Зареждане...</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Нова форма</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Име</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Пространство (по избор)</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border px-3 text-sm"
                    value={spaceId}
                    onChange={(e) => setSpaceId(e.target.value)}
                  >
                    <option value="">Всички пространства</option>
                    {spaces.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Тип съдържание (по избор)</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border px-3 text-sm"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as typeof contentType)}
                  >
                    <option value="">Всички типове</option>
                    {(["POST", "ARTICLE", "EVENT"] as const).map((t) => (
                      <option key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Полета</Label>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
                    {contentFields.length === 0 ? (
                      <p className="text-sm text-zinc-500">Няма полета. Създай от Админ → Полета.</p>
                    ) : (
                      contentFields.map((field) => (
                        <label key={field.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedFields.includes(field.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedFields([...selectedFields, field.id]);
                              else setSelectedFields(selectedFields.filter((id) => id !== field.id));
                            }}
                          />
                          {field.label} ({field.key})
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full">Създай форма</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {forms.length === 0 && (
              <p className="text-sm text-zinc-500">Все още няма форми.</p>
            )}
            {forms.map((form) => (
              <Card key={form.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{form.name}</p>
                      <p className="text-sm text-zinc-500">{form.slug}</p>
                    </div>
                    <Badge variant="secondary">{scopeLabel(form)}</Badge>
                  </div>
                  {form.fields.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {form.fields.map((ff) => (
                        <Badge key={ff.field.id} variant="outline">{ff.field.label}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
