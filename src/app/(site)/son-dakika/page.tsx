import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveList } from "@/components/site/archive-list";
import { getLatestArticles, paginateEntries, parsePageNumber } from "@/lib/archives";

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
  const latest = getLatestArticles();
  const page = paginateEntries(latest, parsePageNumber((await searchParams).sayfa));

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
    />
  );
}
