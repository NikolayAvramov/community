import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { getSiteSettings, updateSiteSettings } from "@/lib/settings";
import { siteSettingSchema } from "@/lib/validators";

export async function GET() {
  const settings = await getSiteSettings();
  return apiSuccess(settings);
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = siteSettingSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const settings = await updateSiteSettings(parsed.data);
    return apiSuccess(settings);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
