import type { ArticlePreview } from "@/lib/homepage";

/**
 * Card fixtures for tests that exercise presentation rather than the database.
 * The adapters that talk to Supabase are covered end-to-end by Playwright against
 * the seeded local stack; unit tests stay on the pure helpers.
 */
export function makePreview(index: number, overrides: Partial<ArticlePreview> = {}) {
  return {
    id: `article-${index}`,
    slug: `haber-${index}`,
    title: `Ege'den haber ${index}`,
    summary: `Özet ${index}`,
    topic: "Gündem",
    topicSlug: "gundem",
    location: "İzmir",
    publishedLabel: "09:42",
    readingTime: "4 dk",
    mediaTone: "teal",
    ...overrides,
  } satisfies ArticlePreview;
}

/** `count` previews numbered from 1, in the order a newest-first query returns them. */
export function makePreviews(count: number): ArticlePreview[] {
  return Array.from({ length: count }, (_, index) => makePreview(index + 1));
}
