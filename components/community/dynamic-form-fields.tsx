"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import type { FieldType } from "@prisma/client";

type FormField = {
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
};

type Props = {
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
};

export function DynamicFormFields({ fields, values, onChange }: Props) {
  return (
    <div className="space-y-4">
      {fields.map(({ field, required }) => (
        <div key={field.id} className="space-y-2">
          <Label>
            {field.label}
            {required && <span className="text-red-500"> *</span>}
          </Label>
          {field.description && <p className="text-xs text-zinc-500">{field.description}</p>}

          {field.type === "IMAGE" ? (
            <ImageUpload
              label=""
              value={(values[field.key] as string) ?? ""}
              onChange={(url) => onChange(field.key, url)}
            />
          ) : field.type === "TEXTAREA" || field.type === "RICH_TEXT" ? (
            <Textarea
              value={(values[field.key] as string) ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={required}
            />
          ) : field.type === "SELECT" ? (
            <select
              className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={(values[field.key] as string) ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              required={required}
            >
              <option value="">Избери...</option>
              {(field.options as string[] | undefined)?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.type === "CHECKBOX" ? (
            <input
              type="checkbox"
              checked={Boolean(values[field.key])}
              onChange={(e) => onChange(field.key, e.target.checked)}
            />
          ) : (
            <Input
              type={field.type === "NUMBER" ? "number" : field.type === "EMAIL" ? "email" : field.type === "URL" ? "url" : field.type === "DATE" ? "date" : field.type === "DATETIME" ? "datetime-local" : "text"}
              value={(values[field.key] as string) ?? ""}
              onChange={(e) => onChange(field.key, field.type === "NUMBER" ? Number(e.target.value) : e.target.value)}
              required={required}
            />
          )}
        </div>
      ))}
    </div>
  );
}
