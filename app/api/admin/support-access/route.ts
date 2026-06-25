import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import {
  buildSupportAccessUrl,
  disableSupportAccess,
  enableSupportAccess,
  getSupportAccessSettings,
  isSupportAccessActive,
} from "@/lib/support-access";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const settings = await getSupportAccessSettings();
    const active = isSupportAccessActive(settings);
    const origin = new URL(request.url).origin;

    return apiSuccess({
      enabled: active,
      enabledAt: settings.enabledAt,
      expiresAt: settings.expiresAt,
      accessUrl: active && settings.token ? buildSupportAccessUrl(settings.token, origin) : null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const origin = new URL(request.url).origin;

    if (body.action === "disable") {
      await disableSupportAccess();
      return apiSuccess({ enabled: false, accessUrl: null });
    }

    const settings = await enableSupportAccess();
    return apiSuccess({
      enabled: true,
      enabledAt: settings.enabledAt,
      expiresAt: settings.expiresAt,
      accessUrl: settings.token ? buildSupportAccessUrl(settings.token, origin) : null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
