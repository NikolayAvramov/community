export function buildSpaceInviteUrl(token: string, origin: string): string {
  return `${origin}/invitations?token=${encodeURIComponent(token)}`;
}

export function isInvitationValid(invitation: {
  status: string;
  expiresAt: Date | null;
}): boolean {
  if (invitation.status !== "PENDING") return false;
  if (invitation.expiresAt && invitation.expiresAt < new Date()) return false;
  return true;
}
