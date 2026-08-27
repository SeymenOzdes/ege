import { ARCHIVE_PAGE_SIZE } from "@/lib/archives";

/**
 * Pure query helpers for /arama. They live outside `search.ts` because that
 * module is `server-only`; keeping the parsing and URL logic here makes it
 * directly unit-testable, the way `turkish.ts` and `auth/redirect.ts` are.
 */

/** Search pages the same way archives do, so the two feel identical. */
export const SEARCH_PAGE_SIZE = ARCHIVE_PAGE_SIZE;

export const SEARCH_QUERY_MIN_LENGTH = 2;
/** Mirrors the `search_queries_query_length` check constraint. */
export const SEARCH_QUERY_MAX_LENGTH = 120;

export type SearchQueryState = "empty" | "too-short" | "too-long" | "ok";

export type NormalizedSearchQuery = {
  /** Whitespace-collapsed query, safe to echo back into the UI. */
  query: string;
  state: SearchQueryState;
};

/** Validates raw `?q=` input before it ever reaches the database. */
export function normalizeSearchQuery(raw: string | undefined | null): NormalizedSearchQuery {
  const query = (raw ?? "").replace(/\s+/g, " ").trim();

  if (query.length === 0) return { query, state: "empty" };
  if (query.length < SEARCH_QUERY_MIN_LENGTH) return { query, state: "too-short" };
  if (query.length > SEARCH_QUERY_MAX_LENGTH) return { query, state: "too-long" };
  return { query, state: "ok" };
}

export type SearchHrefParameters = {
  query?: string;
  topicSlug?: string | null;
  locationSlug?: string | null;
  page?: number;
};

/**
 * Builds `/arama` URLs so the pager and the filter form preserve one another's
 * state. Page 1 is left implicit, matching the archive pager.
 */
export function buildSearchHref({
  query,
  topicSlug,
  locationSlug,
  page = 1,
}: SearchHrefParameters): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (topicSlug) params.set("konu", topicSlug);
  if (locationSlug) params.set("sehir", locationSlug);
  if (page > 1) params.set("sayfa", String(page));

  const search = params.toString();
  return search ? `/arama?${search}` : "/arama";
}
