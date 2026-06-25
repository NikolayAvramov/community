import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { formSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const forms = await prisma.formDefinition.findMany({
      include: {
        fields: { orderBy: { order: "asc" }, include: { field: true } },
        space: { select: { id: true, name: true, slug: true } },
        _count: { select: { fields: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(forms);
  } catch (e) {
    console.error("[GET /api/admin/forms]", e);
    const message = e instanceof Error ? e.message : "Грешка при зареждане на форми";
    return apiError(message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const body = await request.json();
    const parsed = formSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const slug = data.slug ?? slugify(data.name);

    const form = await prisma.formDefinition.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        entityType: data.entityType,
        contentType: data.contentType,
        spaceId: data.spaceId ?? undefined,
        fields: data.fieldIds
          ? {
              create: data.fieldIds.map((f) => ({
                fieldId: f.fieldId,
                order: f.order,
                required: f.required,
              })),
            }
          : undefined,
      },
      include: {
        fields: { include: { field: true } },
        space: { select: { id: true, name: true, slug: true } },
      },
    });

    return apiSuccess(form, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}
