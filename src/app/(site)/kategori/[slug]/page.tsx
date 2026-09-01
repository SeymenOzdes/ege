import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveList } from "@/components/site/archive-list";
import { getCategoryArchive, type CategoryArchive } from "@/lib/archives";
import { parsePageNumber } from "@/lib/pagination";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

function describeKind(kind: "topic" | "location"): string {
  return kind === "topic" ? "Haber dosyası" : "Şehir";
}

function describeArchive(archive: CategoryArchive): string {
  return archive.description ?? `${archive.name} ilinden güncel haberler ve dosyalar.`;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  // `getCategoryArchive` is wrapped in React `cache()`, so this shares the page
  // body's queries rather than hitting the database a second time per request.
  const archive = await getCategoryArchive(slug, parsePageNumber(query.sayfa));

  if (!archive) return {};

  return {
    title: archive.name,
    description: describeArchive(archive),
    alternates: { canonical: `/kategori/${archive.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const archive = await getCategoryArchive(slug, parsePageNumber(query.sayfa));

  if (!archive) notFound();

  return (
    <ArchiveList
      eyebrow={describeKind(archive.kind)}
      title={archive.name}
      description={describeArchive(archive)}
      entries={archive.page.entries}
      basePath={`/kategori/${archive.slug}`}
      currentPage={archive.page.currentPage}
      totalPages={archive.page.totalPages}
      total={archive.page.total}
      loadError={archive.page.loadError}
    />
  );
}
