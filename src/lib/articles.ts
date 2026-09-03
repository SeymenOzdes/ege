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
import { sanitizeHref } from "@/lib/article-links";
import type { ArticleImage, ArticlePreview } from "@/lib/homepage";
import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

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

/**
 * Bir paragrafın içindeki tek biçimli metin parçası.
 *
 * `spans`, blok tek ve işaretsiz bir parçadan ibaretse hiç yazılmaz: TipTap
 * öncesi kaydedilmiş satırlar böylece bayt bayt aynı kalıyor ve jsonb şişmiyor.
 * Yazıldığında değişmez şu: `text`, span metinlerinin birleşimine eşittir —
 * `body_text` ve onun ürettiği `search_vector` bu sayede hiç değişmedi.
 */
export type ArticleInlineSpan = {
  text: string;
  bold?: true;
  italic?: true;
  underline?: true;
  strike?: true;
  /** `sanitizeHref`'ten geçmiş adres; ham istemci girdisi buraya ulaşmaz. */
  href?: string;
};

export type ArticleListItem = { text: string; spans?: ArticleInlineSpan[] };

export type ArticleBodyBlock =
  | { type: "paragraph"; text: string; spans?: ArticleInlineSpan[] }
  | { type: "heading"; level: 2 | 3; text: string; spans?: ArticleInlineSpan[] }
  | { type: "quote"; text: string; attribution: string; spans?: ArticleInlineSpan[] }
  | { type: "list"; ordered: boolean; items: ArticleListItem[] };

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

const inlineMarks = ["bold", "italic", "underline", "strike"] as const;

/** Kayıtlı `spans` dizisi → çizilebilir parçalar. Hiç geçerli parça yoksa `undefined`. */
function parseInlineSpans(value: unknown): ArticleInlineSpan[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const spans = value.flatMap((entry): ArticleInlineSpan[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.text !== "string" || record.text === "") return [];

    const span: ArticleInlineSpan = { text: record.text };
    for (const mark of inlineMarks) {
      if (record[mark] === true) span[mark] = true;
    }

    // Adres burada da süzülüyor: satır düzgün doğrulanmış bir formdan geçmemiş
    // olabilir ve `href` sonunda bir `<a>` özniteliğine yazılacak.
    const href = sanitizeHref(record.href);
    if (href !== undefined) span.href = href;

    return [span];
  });

  return spans.length > 0 ? spans : undefined;
}

/**
 * Paragraf, ara başlık, alıntı ve liste maddesinin ortak satır içi gövdesi.
 *
 * `spans` varsa `text` ondan yeniden üretiliyor; böylece çizilen metin her zaman
 * çizilen parçaların birleşimi oluyor, kayıtta ikisi ayrışmış olsa bile.
 */
function parseInlineContent(
  record: Record<string, unknown>,
): { text: string; spans?: ArticleInlineSpan[] } | undefined {
  const spans = parseInlineSpans(record.spans);
  if (spans) {
    const text = spans.map((span) => span.text).join("");
    return text === "" ? undefined : { text, spans };
  }

  const { text } = record;
  return typeof text === "string" && text !== "" ? { text } : undefined;
}

function parseListItems(value: unknown): ArticleListItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): ArticleListItem[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const item = parseInlineContent(entry as Record<string, unknown>);
    return item ? [item] : [];
  });
}

/**
 * Narrows the stored `body` jsonb onto the block union the renderer understands.
 *
 * The schema only guarantees the column is an array (`articles_body_is_array`), so
 * an unrecognised block is dropped rather than crashing the page — a malformed
 * paragraph should cost one paragraph, not the whole article.
 *
 * TipTap editöründen önce yazılmış satırlar olduğu gibi okunuyor: `spans` yoksa
 * `text` düz basılıyor, `level` taşımayan bir ara başlık H2 sayılıyor.
 */
export function parseArticleBody(value: unknown): ArticleBodyBlock[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((block): ArticleBodyBlock[] => {
    if (typeof block !== "object" || block === null) return [];
    const record = block as Record<string, unknown>;
    const { type } = record;

    if (type === "list") {
      const items = parseListItems(record.items);
      return items.length > 0 ? [{ type, ordered: record.ordered === true, items }] : [];
    }

    const inline = parseInlineContent(record);
    if (!inline) return [];

    if (type === "paragraph") return [{ type, ...inline }];
    if (type === "heading") return [{ type, level: record.level === 3 ? 3 : 2, ...inline }];
    if (type === "quote" && typeof record.attribution === "string") {
      return [{ type, attribution: record.attribution, ...inline }];
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
 *
 * Read anonymously on purpose. Carrying the reader's cookies would make the route
 * request-time and uncacheable, and it would also let a signed-in editor see a draft
 * through `articles_staff_manage` — a cached page must not vary by who asked for it.
 * Editors preview unpublished work in the admin panel instead.
 */
export const getArticleBySlug = cache(async (slug: string): Promise<ArticleDetail | undefined> => {
  if (!hasSupabasePublicConfig()) return undefined;

  const supabase = createAnonClient();
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
  const updatedAt = row.updated_at && row.updated_at > publishedAt ? row.updated_at : undefined;

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

/** How many recent stories `generateStaticParams` prerenders at build time. */
const PRERENDERED_ARTICLE_COUNT = 100;

/**
 * Slugs worth prerendering. Deliberately not the full archive: `dynamicParams` stays
 * on, so an older slug is rendered on its first request and cached from then on.
 * Returns an empty list on any failure — a build should not fail over a warm-up list.
 */
export async function getPublishedArticleSlugs(): Promise<string[]> {
  if (!hasSupabasePublicConfig()) return [];

  // Cookie-free by necessity: `generateStaticParams` runs at build time with no
  // request, and the session-carrying client throws there.
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .order("published_at", { ascending: false })
    .limit(PRERENDERED_ARTICLE_COUNT);

  if (error) return [];

  return (data ?? []).map((row) => row.slug);
}

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
