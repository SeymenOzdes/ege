import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaffRoute } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const role = await requireStaffRoute();
  return <AdminShell role={role}>{children}</AdminShell>;
}
