import { signToken } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { getSupportUser, validateSupportToken } from "@/lib/support-access";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    if (!token) return apiError("Липсва токен", 400);

    const valid = await validateSupportToken(token);
    if (!valid) return apiError("Невалиден или изтекъл линк за поддръжка", 403);

    const user = await getSupportUser();
    if (!user) return apiError("Support акаунтът не е конфигуриран", 500);

    const sessionToken = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    });

    const response = apiSuccess({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      redirect: "/admin",
    });

    response.cookies.set("token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch {
    return apiError("Сървърна грешка", 500);
  }
}
