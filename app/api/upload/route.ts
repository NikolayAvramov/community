import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function POST(request: Request) {
  try {
    await requireSession();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) return apiError("Липсва файл");
    if (!ALLOWED.has(file.type)) return apiError("Позволени са само JPG, PNG, GIF и WebP");
    if (file.size > MAX_SIZE) return apiError("Максимален размер: 5MB");

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${safeExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

    return apiSuccess({ url: `/uploads/${filename}` });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Грешка при качване";
    const status = message === "Unauthorized" ? 401 : 500;
    return apiError(message, status);
  }
}
