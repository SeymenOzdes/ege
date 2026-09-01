import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveList } from "@/components/site/archive-list";
import { getLatestArticles } from "@/lib/archives";
import { parsePageNumber } from "@/lib/pagination";

// Arşiv sayfalaması `?sayfa=` ile yapılıyor; arama parametresi okuyan bir rota
// Next'te istek zamanlıdır, dolayısıyla burada `revalidate` yazmak yanıltıcı olurdu.
// Bu sayfaları da önbelleğe almak sayfalamayı yol parçasına taşımayı gerektirir
// (`/son-dakika/sayfa/2`) — ayrı bir iş, adres değişikliği demek.

export const metadata: Metadata = {
  title: "Son Dakika",
  description: "Ege Bölgesi'nden en güncel haberler dakika dakika.",
  alternates: { canonical: "/son-dakika" },
};

export default async function SonDakikaPage({
  searchParams,
}: {
  searchParams: Promise<{ sayfa?: string }>;
}) {
  const page = await getLatestArticles(parsePageNumber((await searchParams).sayfa));

  if (!page) notFound();

  return (
    <ArchiveList
      eyebrow="Canlı akış"
      title="Son dakika"
      description="Ege Bölgesi'nden en güncel haberler."
      entries={page.entries}
      basePath="/son-dakika"
      currentPage={page.currentPage}
      totalPages={page.totalPages}
      total={page.total}
      loadError={page.loadError}
    />
  );
}
