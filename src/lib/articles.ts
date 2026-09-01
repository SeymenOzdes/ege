import "server-only";

import { cache } from "react";
import type { Metadata } from "next";
import {
  countWords,
  formatFullDateTime,
  toArticlePreview,
  type ArticlePreviewRow,
  type MediaAssetRow,
} from "@/lib/article-preview";
import { getRelatedArticles } from "@/lib/archives";
import type { ArticleImage, ArticlePreview } from "@/lib/homepage";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type ArticleAuthor = {
  name: string;
  slug: string;
  role: string;
};

/** A hero image plus the credit line only the detail page has room for. */
export type ArticleMedia = ArticleImage & {
  caption?: string;
  credit?: string;
};

export type ArticleBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution: string };

export type ArticleDetail = ArticlePreview & {
  author: ArticleAuthor;
  publishedAt: string;
  publishedDisplay: string;
  updatedAt?: string;
  updatedDisplay?: string;
  /** Absent until an editor attaches a hero asset; the page then omits the figure. */
  hero?: ArticleMedia;
  body: ArticleBodyBlock[];
  /** Transparency note; absent while no correction has been recorded. */
  correction?: string;
  /** The topic's standing description, shown in the reading aside. */
  topicDescription?: string;
  related: ArticlePreview[];
};

// The hero embed names its foreign key: `articles` reaches `media_assets` through both
// `hero_media_id` and `social_media_id`, and PostgREST rejects the ambiguity.
const ARTICLE_DETAIL_SELECTION =
  "id, slug, title, summary, body, body_text, published_at, updated_at," +
  " topic:topics(id, name, slug, description)," +
  " location:locations(name, slug)," +
  " author:authors(name, slug, role_label)," +
  " hero:media_assets!articles_hero_media_id_fkey(object_path, alt_text, caption, credit, width, height, focal_point_x, focal_point_y)";

type ArticleDetailRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: unknown;
  body_text: string | null;
  published_at: string | null;
  updated_at: string | null;
  topic: { id: string; name: string; slug: string; description: string | null } | null;
  location: { name: string; slug: string } | null;
  author: { name: string; slug: string; role_label: string | null } | null;
  hero: (MediaAssetRow & { caption: string | null; credit: string | null }) | null;
};

/**
 * Narrows the stored `body` jsonb onto the block union the renderer understands.
 *
 * The schema only guarantees the column is an array (`articles_body_is_array`), so
 * an unrecognised block is dropped rather than crashing the page — a malformed
 * paragraph should cost one paragraph, not the whole article.
 */
export function parseArticleBody(value: unknown): ArticleBodyBlock[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((block): ArticleBodyBlock[] => {
    if (typeof block !== "object" || block === null) return [];
    const { type, text, attribution } = block as Record<string, unknown>;
    if (typeof text !== "string" || text === "") return [];

    if (type === "paragraph" || type === "heading") return [{ type, text }];
    if (type === "quote" && typeof attribution === "string") {
      return [{ type, text, attribution }];
    }
    return [];
  });
}

function toPreviewRow(row: ArticleDetailRow): ArticlePreviewRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    topic_name: row.topic?.name ?? null,
    topic_slug: row.topic?.slug ?? null,
    location_name: row.location?.name ?? null,
    location_slug: row.location?.slug ?? null,
    published_at: row.published_at,
    word_count: countWords(row.body_text),
    hero: row.hero,
  };
}

/**
 * Loads one published article by slug. `articles_public_select` does the gating, so
 * a draft, scheduled or archived slug simply comes back empty and the route renders
 * the not-found boundary. Wrapped in `cache()` because the route resolves the same
 * slug twice per request — once for `generateMetadata`, once for the page body.
 */
export const getArticleBySlug = cache(async (slug: string): Promise<ArticleDetail | undefined> => {
  if (!hasSupabasePublicConfig()) return undefined;

  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_DETAIL_SELECTION)
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return undefined;

  const row = data as unknown as ArticleDetailRow;
  const publishedAt = row.published_at;
  // `articles_public_select` already excludes null publication dates; this keeps
  // the non-null contract honest for the byline and JSON-LD below.
  if (!publishedAt) return undefined;

  // An article is only "updated" once the edit lands after publication.
  const updatedAt =
    row.updated_at && row.updated_at > publishedAt ? row.updated_at : undefined;

  const preview = toArticlePreview(toPreviewRow(row));

  return {
    ...preview,
    // The cards need no credit line; the detail figure does, so it is layered on here
    // rather than widening the shared preview shape.
    hero: preview.hero && {
      ...preview.hero,
      caption: row.hero?.caption ?? undefined,
      credit: row.hero?.credit ?? undefined,
    },
    author: {
      name: row.author?.name ?? "Ege'nin Nabzı",
      slug: row.author?.slug ?? "",
      role: row.author?.role_label ?? "Haber merkezi",
    },
    publishedAt,
    publishedDisplay: formatFullDateTime(publishedAt),
    updatedAt,
    updatedDisplay: updatedAt ? formatFullDateTime(updatedAt) : undefined,
    body: parseArticleBody(row.body),
    topicDescription: row.topic?.description ?? undefined,
    related: await getRelatedArticles(row.id, row.topic?.id ?? null),
  };
});

export function getArticleMetadata(article: ArticleDetail): Metadata {
  const canonicalPath = `/haber/${article.slug}`;
  const images = article.hero
    ? [
        {
          url: article.hero.src,
          width: article.hero.width,
          height: article.hero.height,
          alt: article.hero.alt,
        },
      ]
    : undefined;

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      locale: "tr_TR",
      title: article.title,
      description: article.summary,
      url: canonicalPath,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: article.hero ? [article.hero.src] : undefined,
    },
  };
}
