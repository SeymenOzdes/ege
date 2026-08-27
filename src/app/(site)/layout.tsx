import type { ReactNode } from "react";
import { PublicShell } from "@/components/site/public-shell";
import { getCurrentUser } from "@/lib/auth/server";

// The public header renders verified account state; rendering is per-request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getCurrentUser();
  return <PublicShell user={user}>{children}</PublicShell>;
}
