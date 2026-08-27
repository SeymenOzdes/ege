import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveList } from "@/components/site/archive-list";
import { getCategoryArchive, paginateEntries, parsePageNumber } from "@/lib/archives";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

function describeKind(kind: "topic" | "location"): string {
  return kind === "topic" ? "Haber dosyası" : "Şehir";
}

function describeArchive(archive: NonNullable<ReturnType<typeof getCategoryArchive>>): string {
  return archive.description ?? `${archive.name} ilinden güncel haberler ve dosyalar.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const archive = getCategoryArchive(slug);

  if (!archive) return {};

  return {
    title: archive.name,
    description: describeArchive(archive),
    alternates: { canonical: `/kategori/${archive.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const archive = getCategoryArchive(slug);

  if (!archive) notFound();

  const page = paginateEntries(archive.articles, parsePageNumber(query.sayfa));

  if (!page) notFound();

  return (
    <ArchiveList
      eyebrow={describeKind(archive.kind)}
      title={archive.name}
      description={describeArchive(archive)}
      entries={page.entries}
      basePath={`/kategori/${archive.slug}`}
      currentPage={page.currentPage}
      totalPages={page.totalPages}
      total={page.total}
    />
  );
}
