import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/site/article-detail";
import { articleSlugs, getArticleBySlug, getArticleMetadata } from "@/lib/articles";
import { getCurrentUser } from "@/lib/auth/server";
import { isArticleBookmarked } from "@/lib/bookmarks/queries";
import { bookmarkNotice } from "@/lib/bookmarks/messages";

export const dynamicParams = false;

export function generateStaticParams() {
  return articleSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return {};

  return getArticleMetadata(article);
}

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bilgi?: string | string[] }>;
};

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  const isSignedIn = Boolean(user);
  const isSaved = isSignedIn ? await isArticleBookmarked(slug) : false;
  const notice = bookmarkNotice(typeof query.bilgi === "string" ? query.bilgi : undefined);

  return (
    <>
      {notice ? (
        <p
          className={`shell-container mt-6 rounded-[18px] px-4 py-3 text-sm ${
            notice.tone === "success"
              ? "bg-[color-mix(in_srgb,var(--color-teal)_12%,white)] text-[var(--color-teal)]"
              : "bg-red-50 text-red-700"
          }`}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.text}
        </p>
      ) : null}
      <ArticleDetail article={article} isSaved={isSaved} isSignedIn={isSignedIn} />
    </>
  );
}
