import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = "MY_SECRET_KEY";

export async function GET(request: Request) {
  try {
    const token = request.headers
      .get("cookie")
      ?.split("token=")[1]
      ?.split(";")[0];

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);
    const posts = await prisma.post.findMany({ include: { author: true } });
    return NextResponse.json(posts, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
}
