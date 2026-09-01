import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaffRoute } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

/**
 * Yönetim paneli `robots.txt` ile zaten kapalı; bu ikinci kilit.
 *
 * `robots.txt` yalnızca taramayı engeller, dizine girmeyi değil: bir yönetim
 * adresi dışarıdan bağlanmışsa arama motoru sayfayı taramadan da dizine
 * alabilir. `noindex` bunu keser. `nofollow` da veriliyor çünkü buradaki
 * bağlantıların hiçbiri kamuya açık bir hedefe çıkmıyor.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const role = await requireStaffRoute();
  return <AdminShell role={role}>{children}</AdminShell>;
}
