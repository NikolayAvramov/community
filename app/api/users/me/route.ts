import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { profileSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/api";
import { saveCustomFieldValues } from "@/lib/custom-fields";

export async function GET() {
  const session = await getSession();
  if (!session) return apiError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, avatar: true, bio: true, role: true },
  });

  return apiSuccess(user);
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) return apiError("Unauthorized", 401);

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        name: data.name,
        bio: data.bio,
        avatar: data.avatar === "" ? null : data.avatar,
      },
      select: { id: true, name: true, email: true, avatar: true, bio: true, role: true },
    });

    if (data.customFields) {
      await saveCustomFieldValues("user", session.id, data.customFields);
    }

    return apiSuccess(user);
  } catch {
    return apiError("Server error", 500);
  }
}
