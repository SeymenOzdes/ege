import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { getClaimString, getUserRole, isStaffRole, type UserRole } from "@/lib/auth/roles";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { isDevAdminAutoLoginEnabled } from "@/lib/auth/dev-access";

export async function getVerifiedUserRole(): Promise<UserRole | undefined> {
  if (!hasSupabasePublicConfig()) return undefined;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return undefined;

  return getUserRole(data.claims);
}

export type CurrentUser = {
  role: UserRole;
  email?: string;
  displayName?: string;
};

/**
 * Display-only identity for the public header. Any verifiable session counts
 * as signed in; readers whose `app_metadata.role` is not assigned yet surface
 * as READERS. Route-level authorization keeps using requireStaffRoute, which
 * never guesses roles.
 */
export async function getCurrentUser(): Promise<CurrentUser | undefined> {
  if (!hasSupabasePublicConfig()) return undefined;

  // Fast path mirroring the proxy: a visit without Supabase auth cookies has
  // no session to resolve, skip client creation and claims verification.
  const cookieStore = await cookies();
  const hasAuthSession = cookieStore
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));
  if (!hasAuthSession) return undefined;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return undefined;

  const claims = data.claims;
  const userId = getClaimString(claims, "sub");
  const email = getClaimString(claims, "email");

  const { data: profile } = userId
    ? await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle()
    : { data: null };

  return {
    role: getUserRole(claims) ?? "READER",
    email,
    displayName: profile?.display_name ?? undefined,
  };
}

export async function requireStaffRoute(nextPath = "/yonetim") {
  const role = await getVerifiedUserRole();
  if (!role) {
    const safeNextPath = encodeURIComponent(getSafeRedirectPath(nextPath, "/yonetim"));

    // Yerel geliştirme hızlı girişi: geliştiriciyi seed admin'i ile gerçek bir
    // oturuma sokar; RLS rolleri gerçek JWT'den okumaya devam eder.
    if (isDevAdminAutoLoginEnabled()) {
      redirect(`/auth/dev-login?next=${safeNextPath}`);
    }

    redirect(`/giris?next=${safeNextPath}`);
  }

  if (!isStaffRole(role)) {
    redirect("/?error=yonetim-yetkisi");
  }

  return role;
}

export async function requireAdminRoute(nextPath = "/yonetim") {
  const role = await requireStaffRoute(nextPath);
  if (role !== "ADMIN") redirect("/yonetim?error=yonetim-yetkisi");
  return role;
}
