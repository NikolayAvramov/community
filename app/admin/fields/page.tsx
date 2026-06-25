"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FIELD_TYPE_LABELS, CONTENT_TYPE_LABELS } from "@/lib/constants";
import { fieldKeyFromText } from "@/lib/utils";
import type { FieldType } from "@prisma/client";

type Field = {
  id: number;
  key: string;
  label: string;
  type: FieldType;
  entityType: string;
  isActive: boolean;
};

const FIELD_TYPES = Object.keys(FIELD_TYPE_LABELS) as FieldType[];
const CONTENT_TYPES = ["POST", "ARTICLE", "EVENT"] as const;

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [keyTouched, setKeyTouched] = useState(false);
  const [form, setForm] = useState({
    key: "",
    label: "",
    type: "TEXT" as FieldType,
    entityType: "content",
    options: "",
    applicableTypes: [...CONTENT_TYPES] as string[],
  });

  const load = () =>
    fetch("/api/admin/fields", { credentials: "include" })
      .then((r) => r.json())
      .then(setFields);

  useEffect(() => { load(); }, []);

  const previewKey = fieldKeyFromText(form.key || form.label);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const key = fieldKeyFromText(form.key || form.label);
    if (!form.label.trim()) {
      setError("Въведи етикет на полето.");
      return;
    }
    if (!key) {
      setError("Неуспешно генериране на ключ. Опитай с друг етикет.");
      return;
    }

    const res = await fetch("/api/admin/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        key,
        label: form.label.trim(),
        type: form.type,
        entityType: form.entityType,
        options: form.options ? form.options.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        applicableTypes: form.entityType === "content" ? form.applicableTypes : undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Грешка при създаване");
      return;
    }

    setForm({
      key: "",
      label: "",
      type: "TEXT",
      entityType: "content",
      options: "",
      applicableTypes: [...CONTENT_TYPES],
    });
    setKeyTouched(false);
    load();
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/fields/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Изтриване на поле?")) return;
    await fetch(`/api/admin/fields/${id}`, { method: "DELETE", credentials: "include" });
    load();
  };

  const toggleApplicableType = (type: string) => {
    setForm((f) => ({
      ...f,
      applicableTypes: f.applicableTypes.includes(type)
        ? f.applicableTypes.filter((t) => t !== type)
        : [...f.applicableTypes, type],
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Персонализирани полета</h1>
        <p className="text-zinc-500">
          Етикетът може да е на кирилица — техническият ключ се генерира автоматично.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Ново поле</CardTitle></CardHeader>
          <CardContent>
            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Етикет (показва се на потребителите)</Label>
                <Input
                  value={form.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setForm((f) => ({
                      ...f,
                      label,
                      key: keyTouched ? f.key : fieldKeyFromText(label),
                    }));
                  }}
                  placeholder="Напр. Компания, Град, Телефон"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Технически ключ (по избор)</Label>
                <Input
                  value={form.key}
                  onChange={(e) => {
                    setKeyTouched(true);
                    setForm({ ...form, key: e.target.value });
                  }}
                  placeholder="Автоматично от етикета"
                />
                {previewKey && (
                  <p className="text-xs text-zinc-500">
                    Ще се запази като: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{previewKey}</code>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Тип</Label>
                <select className="flex h-10 w-full rounded-lg border px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as FieldType })}>
                  {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>За</Label>
                <select className="flex h-10 w-full rounded-lg border px-3 text-sm" value={form.entityType} onChange={(e) => setForm({ ...form, entityType: e.target.value })}>
                  <option value="content">Съдържание</option>
                  <option value="user">Потребител</option>
                </select>
              </div>
              {form.entityType === "content" && (
                <div className="space-y-2">
                  <Label>За типове съдържание</Label>
                  <div className="flex flex-wrap gap-3">
                    {CONTENT_TYPES.map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.applicableTypes.includes(type)}
                          onChange={() => toggleApplicableType(type)}
                        />
                        {CONTENT_TYPE_LABELS[type]}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">Включи „POST“, ако полето трябва да се вижда при обикновени постове.</p>
                </div>
              )}
              {(form.type === "SELECT" || form.type === "MULTI_SELECT") && (
                <div className="space-y-2">
                  <Label>Опции (разделени със запетая)</Label>
                  <Input value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder="София, Пловдив, Варна" />
                </div>
              )}
              <Button type="submit" className="w-full">Създай поле</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {fields.length === 0 && (
            <p className="text-sm text-zinc-500">Все още няма полета.</p>
          )}
          {fields.map((field) => (
            <Card key={field.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{field.label}</p>
                  <p className="text-sm text-zinc-500">{field.key} · {FIELD_TYPE_LABELS[field.type]} · {field.entityType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={field.isActive ? "success" : "outline"}>{field.isActive ? "Активно" : "Неактивно"}</Badge>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(field.id, field.isActive)}>
                    {field.isActive ? "Изключи" : "Включи"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(field.id)}>Изтрий</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
