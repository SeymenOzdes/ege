import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveList } from "@/components/site/archive-list";
import { getAuthorArticles, getAuthorBySlug, paginateEntries, parsePageNumber } from "@/lib/archives";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  if (!author) return {};

  return {
    title: author.name,
    description: author.bio,
    alternates: { canonical: `/yazar/${author.slug}` },
  };
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const author = getAuthorBySlug(slug);

  if (!author) notFound();

  const authored = getAuthorArticles(author.slug);
  const page = paginateEntries(authored, parsePageNumber(query.sayfa));

  if (!page) notFound();

  return (
    <ArchiveList
      eyebrow={author.role}
      title={author.name}
      description={author.bio}
      entries={page.entries}
      basePath={`/yazar/${author.slug}`}
      currentPage={page.currentPage}
      totalPages={page.totalPages}
      total={page.total}
    />
  );
}
