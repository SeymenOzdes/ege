import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveList } from "@/components/site/archive-list";
import { JsonLd } from "@/components/site/json-ld";
import { getAuthorArticles, getAuthorBySlug } from "@/lib/archives";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { parsePageNumber } from "@/lib/pagination";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // `getAuthorBySlug` is wrapped in React `cache()`, so the page body reuses this read.
  const author = await getAuthorBySlug(slug);

  if (!author) return {};

  return {
    title: author.name,
    description: author.bio,
    alternates: { canonical: `/yazar/${author.slug}` },
  };
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const author = await getAuthorBySlug(slug);

  if (!author) notFound();

  const page = await getAuthorArticles(author.slug, parsePageNumber(query.sayfa));

  if (!page) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", path: "/" },
          { name: author.name, path: `/yazar/${author.slug}` },
        ])}
      />
      <ArchiveList
        eyebrow={author.role}
        title={author.name}
        description={author.bio}
        entries={page.entries}
        basePath={`/yazar/${author.slug}`}
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        total={page.total}
        loadError={page.loadError}
      />
    </>
  );
}
