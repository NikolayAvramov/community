import type { AuthUser } from "@/app/context/AuthContext";

const GUEST_URLS = new Set(["/register", "/login"]);

const GUEST_LABELS = new Set([
  "регистрация",
  "присъедини се",
  "започни",
  "регистрирай се",
]);

export function resolveCtaForUser(
  user: AuthUser | null,
  buttonUrl?: string | null,
  buttonText?: string | null,
): { url: string | null; text: string | null } {
  if (!buttonUrl) return { url: null, text: buttonText ?? null };

  if (user && GUEST_URLS.has(buttonUrl)) {
    return { url: "/create", text: "Създай публикация" };
  }

  const text = buttonText ?? null;
  if (user && text && GUEST_LABELS.has(text.toLowerCase())) {
    return { url: buttonUrl, text: "Създай публикация" };
  }

  return { url: buttonUrl, text };
}

export function isGuestOnlyUrl(url?: string | null): boolean {
  return Boolean(url && GUEST_URLS.has(url));
}
