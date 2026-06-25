import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { fieldSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";
import { fieldKeyFromText } from "@/lib/utils";

export async function GET() {
  const fields = await prisma.fieldDefinition.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return apiSuccess(fields);
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const body = await request.json();
    const normalized = {
      ...body,
      key: fieldKeyFromText(body.key || body.label || ""),
    };
    const parsed = fieldSchema.safeParse(normalized);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const field = await prisma.fieldDefinition.create({
      data: {
        key: data.key,
        label: data.label,
        description: data.description,
        type: data.type,
        options: data.options,
        validation: data.validation,
        entityType: data.entityType,
        applicableTypes: data.applicableTypes,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    return apiSuccess(field, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
