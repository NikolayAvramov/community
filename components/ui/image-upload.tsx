"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, X } from "lucide-react";

type Props = {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  hint?: string;
};

export function ImageUpload({ label = "Снимка", value, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Грешка при качване");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Грешка");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}

      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-auto max-w-full rounded-lg border object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 p-6 text-center hover:border-violet-300 dark:border-zinc-700"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          ) : (
            <>
              <ImagePlus className="mb-2 h-8 w-8 text-zinc-400" />
              <p className="text-sm text-zinc-500">Кликни за качване (JPG, PNG, до 5MB)</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />

      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? "Качване..." : value ? "Смени снимка" : "Качи снимка"}
        </Button>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-zinc-500">или URL</Label>
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... или /uploads/..."
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
