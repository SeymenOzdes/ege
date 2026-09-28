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
  /** OAuth sağlayıcısının (Google) verdiği profil resmi; magic link oturumlarında yok. */
  avatarUrl?: string;
};

// Google, `user_metadata` içine hem `avatar_url`/`full_name` hem de OIDC adlarını
// (`picture`/`name`) yazar; hangisi gelirse onu kullan.
function getMetadataString(claims: unknown, ...keys: string[]): string | undefined {
  const metadata = (claims as { user_metadata?: unknown } | null)?.user_metadata;
  for (const key of keys) {
    const value = getClaimString(metadata, key);
    if (value) return value;
  }
  return undefined;
}

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
    displayName: displayName || getMetadataString(claims, "full_name", "name"),
    avatarUrl: getMetadataString(claims, "avatar_url", "picture"),
  };
}
