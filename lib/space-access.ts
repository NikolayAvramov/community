import type { Role, Space, SpaceAccessMode } from "@prisma/client";
import type { SessionUser } from "./auth";

export type SpaceAccessInfo = Pick<Space, "accessMode" | "allowMemberPosts" | "isPrivate"> & {
  members?: { userId: number }[];
};

export function isStaff(role: Role) {
  return role === "ADMIN" || role === "SUPPORT" || role === "MODERATOR";
}

export function resolveAccessMode(space: SpaceAccessInfo): SpaceAccessMode {
  if (space.accessMode) return space.accessMode;
  return space.isPrivate ? "RESTRICTED" : "PUBLIC";
}

export function canViewSpace(user: SessionUser | null, space: SpaceAccessInfo): boolean {
  if (user && isStaff(user.role)) return true;

  const mode = resolveAccessMode(space);
  if (mode === "PUBLIC") return true;
  if (!user) return false;
  if (mode === "MEMBERS") return true;
  return space.members?.some((m) => m.userId === user.id) ?? false;
}

export function canPostInSpace(user: SessionUser | null, space: SpaceAccessInfo): boolean {
  if (!user) return false;
  if (isStaff(user.role)) return true;
  if (!canViewSpace(user, space)) return false;
  return space.allowMemberPosts;
}

export function spaceAccessMeta(user: SessionUser | null, space: SpaceAccessInfo) {
  return {
    canView: canViewSpace(user, space),
    canPost: canPostInSpace(user, space),
    accessMode: resolveAccessMode(space),
    allowMemberPosts: space.allowMemberPosts,
  };
}
