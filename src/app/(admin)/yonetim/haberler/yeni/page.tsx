import { AdminComingSoon } from "@/components/admin/admin-coming-soon";

type NewArticlePageProps = { searchParams: Promise<{ breaking?: string | string[] }> };

export default async function NewArticlePage({ searchParams }: NewArticlePageProps) {
  const query = await searchParams;
  const isBreaking = query.breaking === "1";

  return (
    <AdminComingSoon
      description={
        isBreaking
          ? "Son dakika taslağı için editör hazırlanıyor; yayınlamadan önce editoryal inceleme gerekecek."
          : "Yeni haber taslağı ve zengin metin editörü bir sonraki modülde burada açılacak."
      }
      eyebrow={isBreaking ? "Yönetim / Son dakika" : "Yönetim / Yeni haber"}
      title={isBreaking ? "Son dakika taslağı" : "Yeni haber"}
    />
  );
}
