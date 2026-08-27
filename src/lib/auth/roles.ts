export const userRoles = ["ADMIN", "EDITOR", "READER"] as const;

export type UserRole = (typeof userRoles)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getUserRole(claims: unknown): UserRole | undefined {
  if (!isRecord(claims) || !isRecord(claims.app_metadata)) return undefined;

  const role = claims.app_metadata.role;
  return typeof role === "string" && userRoles.includes(role as UserRole)
    ? (role as UserRole)
    : undefined;
}

export function isStaffRole(role: UserRole | undefined) {
  return role === "ADMIN" || role === "EDITOR";
}
