import { getClaimString, getUserRole, type UserRole } from "@/lib/auth/roles";

/**
 * Display-only identity for the public header.
 *
 * Deliberately free of `server-only`: the same shape is produced on the server (for
 * routes that already render per request) and in the browser (`useCurrentUser`), so
 * the header renders identically whichever path resolved it.
 */
export type CurrentUser = {
  role: UserRole;
  email?: string;
  displayName?: string;
};

/**
 * Claims → identity. Any verifiable session counts as signed in; a reader whose
 * `app_metadata.role` has not been assigned yet surfaces as a READER. Authorization
 * never goes through here — `requireStaffRoute` reads the verified role and never
 * guesses.
 */
export function toCurrentUser(claims: unknown, displayName?: string | null): CurrentUser {
  return {
    role: getUserRole(claims) ?? "READER",
    email: getClaimString(claims, "email"),
    displayName: displayName ?? undefined,
  };
}
