import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
  ш: "sh", щ: "sht", ъ: "a", ь: "", ю: "yu", я: "ya",
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_MAP[char] ?? char)
    .join("");
}

export function slugify(text: string, fallback?: string): string {
  const slug = transliterate(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback || `item-${Date.now()}`;
}

/** Нормализира ръчно въведен slug — преобразува кирилица и маха невалидни символи. */
export function normalizeSlug(slug: string): string {
  return slugify(slug, slug.trim().toLowerCase());
}

/** Технически ключ за поле — приема кирилица и я преобразува автоматично. */
export function fieldKeyFromText(text: string, fallback?: string): string {
  const key = transliterate(text)
    .trim()
    .replace(/[^a-z0-9_\s-]/gi, "")
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();

  return key || fallback || `field_${Date.now()}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function isNumericId(value: string): boolean {
  return /^\d+$/.test(value);
}
