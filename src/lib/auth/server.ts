import "server-only";
import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { getUserRole, isStaffRole, type UserRole } from "@/lib/auth/roles";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function getVerifiedUserRole(): Promise<UserRole | undefined> {
  if (!hasSupabasePublicConfig()) return undefined;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return undefined;

  return getUserRole(data.claims);
}

export async function requireStaffRoute(nextPath = "/yonetim") {
  const role = await getVerifiedUserRole();
  if (!role) {
    redirect(`/giris?next=${encodeURIComponent(getSafeRedirectPath(nextPath, "/yonetim"))}`);
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
