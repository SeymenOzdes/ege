import type { ArticlePreview } from "@/lib/homepage";
import { allPreviewArticles } from "@/lib/homepage";

/** Entries shown per archive page. */
export const ARCHIVE_PAGE_SIZE = 6;

export type ArchiveAuthor = {
  name: string;
  slug: string;
  role: string;
  bio: string;
};

export type ArchiveArticle = ArticlePreview & {
  authorSlug: string;
  /** ISO 8601 timestamp with timezone offset; drives archive ordering. */
  publishedAt: string;
};

export type ArchivePage = {
  entries: ArchiveArticle[];
  currentPage: number;
  totalPages: number;
  total: number;
};

export type CategoryArchive = {
  slug: string;
  kind: "topic" | "location";
  name: string;
  description: string | null;
  articles: ArchiveArticle[];
};

const authors: Record<string, ArchiveAuthor> = {
  "ece-aksoy": {
    name: "Ece Aksoy",
    slug: "ece-aksoy",
    role: "Yerel yaşam muhabiri",
    bio: "Ege'nin şehirlerinde yerel yaşam, dayanışma ve kent kültürü üzerine haberler hazırlıyor.",
  },
  "elif-demir": {
    name: "Elif Demir",
    slug: "elif-demir",
    role: "Ekonomi muhabiri",
    bio: "Üretimi, emeği ve zanaatı sahadan izliyor; Ege'nin tarlalarını ve atölyelerini takip ediyor.",
  },
  "kerem-aydin": {
    name: "Kerem Aydın",
    slug: "kerem-aydin",
    role: "Kent ve ulaşım muhabiri",
    bio: "Kamusal yaşam, kıyı hatları ve raylı sistemler üzerine haberler hazırlıyor.",
  },
};

// Demo-day enrichment for the homepage preview catalog. When a preview is added
// to the homepage catalog, it must receive catalog metadata here as well.
const catalogMetadata: Record<string, { authorSlug: string; publishedAt: string }> = {
  "izmirin-kiyi-rotalari": { authorSlug: "kerem-aydin", publishedAt: "2026-08-27T09:42:00+03:00" },
  "zeytinin-yeni-hasat-hikayesi": {
    authorSlug: "elif-demir",
    publishedAt: "2026-08-27T09:18:00+03:00",
  },
  "antik-kentlerde-yaz-aksamlari": {
    authorSlug: "ece-aksoy",
    publishedAt: "2026-08-26T08:55:00+03:00",
  },
  "ege-hattinda-rayli-ulasim": {
    authorSlug: "kerem-aydin",
    publishedAt: "2026-08-26T08:12:00+03:00",
  },
  "kiyi-koylerinde-deniz-nobetleri": {
    authorSlug: "ece-aksoy",
    publishedAt: "2026-08-25T07:48:00+03:00",
  },
  "yerel-tasarim-atolyeleri": { authorSlug: "elif-demir", publishedAt: "2026-08-24T07:20:00+03:00" },
  "gediz-ovasinda-toprak-takibi": {
    authorSlug: "elif-demir",
    publishedAt: "2026-08-23T06:58:00+03:00",
  },
  "mahallede-ortak-sofra": { authorSlug: "ece-aksoy", publishedAt: "2026-08-22T06:30:00+03:00" },
  "mahalle-pazarlarinda-yerel-urun": {
    authorSlug: "ece-aksoy",
    publishedAt: "2026-08-18T08:37:00+03:00",
  },
};

// Canonical topic names/descriptions mirror the seeded database topics.
const topicsBySlug: Record<string, { name: string; description: string }> = {
  gundem: { name: "Gündem", description: "Ege Bölgesi gündemi ve kamusal yaşam." },
  ekonomi: { name: "Ekonomi", description: "Yerel ekonomi, üretim ve emek." },
  "kultur-sanat": { name: "Kültür-Sanat", description: "Kültür, sanat ve tarih." },
  yasam: { name: "Yaşam", description: "Günlük yaşam, çevre ve topluluk." },
};

// Canonical Aegean provinces mirror the seeded database locations.
const locationsBySlug: Record<string, string> = {
  izmir: "İzmir",
  aydin: "Aydın",
  mugla: "Muğla",
  manisa: "Manisa",
  denizli: "Denizli",
  balikesir: "Balıkesir",
};

function sortByPublishedDesc(items: ArchiveArticle[]): ArchiveArticle[] {
  // Same-offset ISO timestamps sort chronologically without parsing.
  return [...items].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
  );
}

function buildCatalog(): ArchiveArticle[] {
  return allPreviewArticles.map((preview) => {
    const meta = catalogMetadata[preview.slug];
    if (!meta) {
      throw new Error(`Missing archive metadata for "${preview.slug}". Add it to catalogMetadata.`);
    }
    return { ...preview, authorSlug: meta.authorSlug, publishedAt: meta.publishedAt };
  });
}

const catalog = sortByPublishedDesc(buildCatalog());

const articlesByAuthorSlug: Map<string, ArchiveArticle[]> = (() => {
  const buckets = new Map<string, ArchiveArticle[]>();
  for (const article of catalog) {
    const bucket = buckets.get(article.authorSlug) ?? [];
    bucket.push(article);
    buckets.set(article.authorSlug, bucket);
  }
  return buckets;
})();

/** Newest-first catalog across all demo articles. */
export function getLatestArticles(): ArchiveArticle[] {
  return catalog;
}

/** Lowercases slugs so Turkish route segments stay case-insensitive. */
export function normalizeArchiveSlug(slug: string): string {
  return slug.toLowerCase();
}

export function getAuthorBySlug(slug: string): ArchiveAuthor | undefined {
  return authors[normalizeArchiveSlug(slug)];
}

export function getAuthorArticles(slug: string): ArchiveArticle[] {
  const articles = articlesByAuthorSlug.get(normalizeArchiveSlug(slug)) ?? [];
  return sortByPublishedDesc(articles);
}

/**
 * Resolves `/kategori/[slug]` archives. Topics take precedence; otherwise the
 * slug is treated as a province so the header city navigation works.
 */
export function getCategoryArchive(slug: string): CategoryArchive | undefined {
  const normalized = normalizeArchiveSlug(slug);

  const topic = topicsBySlug[normalized];
  if (topic) {
    return {
      slug: normalized,
      kind: "topic",
      name: topic.name,
      description: topic.description,
      articles: sortByPublishedDesc(catalog.filter((a) => a.topicSlug === normalized)),
    };
  }

  const locationName = locationsBySlug[normalized];
  if (locationName) {
    return {
      slug: normalized,
      kind: "location",
      name: locationName,
      description: null,
      articles: sortByPublishedDesc(catalog.filter((a) => a.location === locationName)),
    };
  }

  return undefined;
}

/** Related stories newest-first, excluding the current article. */
export function getRelatedArticles(currentSlug: string, limit = 2): ArticlePreview[] {
  return catalog.filter((article) => article.slug !== currentSlug).slice(0, limit);
}

/** Normalizes a raw `sayfa` query value into a usable page number. */
export function parsePageNumber(value: string | undefined): number {
  if (!value) return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 10_000 ? parsed : 1;
}

/**
 * Slices an archive into pages. Returns `undefined` for out-of-range requests
 * so routes can render the permanent not-found boundary.
 */
export function paginateEntries(
  items: ArchiveArticle[],
  pageNumber: number,
): ArchivePage | undefined {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / ARCHIVE_PAGE_SIZE));
  const currentPage = Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber : 1;

  if (currentPage > totalPages) return undefined;

  const start = (currentPage - 1) * ARCHIVE_PAGE_SIZE;
  return {
    entries: items.slice(start, start + ARCHIVE_PAGE_SIZE),
    currentPage,
    totalPages,
    total,
  };
}
