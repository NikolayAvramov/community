import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { apiSuccess } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  return apiSuccess({ user: session });
}

export async function DELETE() {
  const response = apiSuccess({ message: "Logged out" });
  response.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
