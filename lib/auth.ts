import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getSupportAccessSettings, isSupportAccessActive } from "./support-access";
import type { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
  avatar: string | null;
};

export function isAdminRole(role: Role) {
  return role === "ADMIN";
}

export function isStaffRole(role: Role) {
  return role === "ADMIN" || role === "SUPPORT";
}

export function canAccessAdmin(role: Role) {
  return isStaffRole(role);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyToken(token: string): { id: number; email: string; role: Role } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: Role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });

  if (!user) return null;

  if (user.role === "SUPPORT") {
    const supportAccess = await getSupportAccessSettings();
    if (!isSupportAccessActive(supportAccess)) return null;
  }

  return user;
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireStaff(): Promise<SessionUser> {
  const session = await requireSession();
  if (!canAccessAdmin(session.role)) throw new Error("Forbidden");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (!isStaffRole(session.role)) throw new Error("Forbidden");
  return session;
}

export async function requireModerator(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== "ADMIN" && session.role !== "MODERATOR" && session.role !== "SUPPORT") {
    throw new Error("Forbidden");
  }
  return session;
}

export { JWT_SECRET };
