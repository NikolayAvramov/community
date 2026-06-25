export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, { credentials: "include", ...init });
    const text = await res.text();

    if (!text.trim()) {
      return {
        data: null,
        error: res.ok
          ? "Празен отговор от сървъра. Рестартирай dev сървъра (npm run dev)."
          : `Сървърна грешка (${res.status}). Рестартирай npm run dev.`,
      };
    }

    const data = JSON.parse(text) as T & { error?: string };

    if (!res.ok) {
      return { data: null, error: data.error ?? `Грешка ${res.status}` };
    }

    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Мрежова грешка" };
  }
}
