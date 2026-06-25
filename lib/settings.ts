import { prisma } from "./prisma";

export type SiteSettings = {
  siteName: string;
  siteDescription?: string;
  primaryColor?: string;
  logoUrl?: string;
  allowRegistration?: boolean;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Community",
  siteDescription: "Вашата персонализируема общност",
  primaryColor: "#7c3aed",
  allowRegistration: true,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "general" } });
  if (!row?.value || typeof row.value !== "object") return DEFAULT_SITE_SETTINGS;
  return { ...DEFAULT_SITE_SETTINGS, ...(row.value as SiteSettings) };
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const value = { ...current, ...data };
  await prisma.siteSetting.upsert({
    where: { key: "general" },
    create: { key: "general", value },
    update: { value },
  });
  return value;
}
