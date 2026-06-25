import { randomUUID } from "crypto";
import { prisma } from "./prisma";

export const SUPPORT_USER_EMAIL = "support@platform.internal";
export const SUPPORT_ACCESS_DURATION_DAYS = 7;

export type SupportAccessSettings = {
  enabled: boolean;
  token: string | null;
  enabledAt: string | null;
  expiresAt: string | null;
};

const DEFAULT_SUPPORT_ACCESS: SupportAccessSettings = {
  enabled: false,
  token: null,
  enabledAt: null,
  expiresAt: null,
};

export function isSupportAccessActive(settings: SupportAccessSettings): boolean {
  if (!settings.enabled || !settings.token) return false;
  if (!settings.expiresAt) return true;
  return new Date(settings.expiresAt) > new Date();
}

export async function getSupportAccessSettings(): Promise<SupportAccessSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "support_access" } });
  if (!row?.value || typeof row.value !== "object") return DEFAULT_SUPPORT_ACCESS;
  return { ...DEFAULT_SUPPORT_ACCESS, ...(row.value as SupportAccessSettings) };
}

async function saveSupportAccessSettings(value: SupportAccessSettings) {
  await prisma.siteSetting.upsert({
    where: { key: "support_access" },
    create: { key: "support_access", value },
    update: { value },
  });
}

export async function enableSupportAccess(): Promise<SupportAccessSettings> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SUPPORT_ACCESS_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const settings: SupportAccessSettings = {
    enabled: true,
    token: randomUUID(),
    enabledAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  await saveSupportAccessSettings(settings);
  return settings;
}

export async function disableSupportAccess(): Promise<SupportAccessSettings> {
  const settings: SupportAccessSettings = {
    enabled: false,
    token: null,
    enabledAt: null,
    expiresAt: null,
  };
  await saveSupportAccessSettings(settings);
  return settings;
}

export async function validateSupportToken(token: string): Promise<boolean> {
  const settings = await getSupportAccessSettings();
  if (!isSupportAccessActive(settings)) return false;
  return settings.token === token;
}

export function buildSupportAccessUrl(token: string, origin: string): string {
  return `${origin}/support-access?token=${encodeURIComponent(token)}`;
}

export async function getSupportUser() {
  return prisma.user.findUnique({ where: { email: SUPPORT_USER_EMAIL } });
}
