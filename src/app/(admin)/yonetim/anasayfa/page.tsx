import { AdminComingSoon } from "@/components/admin/admin-coming-soon";
import { requireAdminRoute } from "@/lib/auth/server";

export default async function AdminHomepageSettingsPage() {
  await requireAdminRoute("/yonetim/anasayfa");
  return (
    <AdminComingSoon
      description="Ana sayfa içerik sıralaması ve öne çıkan yayın ayarları yalnız yöneticilere açık olacak."
      eyebrow="Yönetim / Yayın ayarları"
      title="Yayın ayarları"
    />
  );
}
