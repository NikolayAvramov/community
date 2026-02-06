import { NextResponse } from "next/server";

export function POST() {
  const response = NextResponse.json(
    { message: "Logged out" },
    { status: 200 },
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    sameSite: "strict",
    path: "/",
  });

  return response;
}
