/**
 * Route-parameter helpers shared by every paged surface — archives, search and
 * saved items. Deliberately free of `server-only` and of any Supabase import so
 * the modules that do talk to the database can stay server-only while these stay
 * unit-testable.
 */

/** Entries shown per archive page. Search reuses it so paging feels uniform. */
export const ARCHIVE_PAGE_SIZE = 6;

/** Lowercases slugs so Turkish route segments stay case-insensitive. */
export function normalizeArchiveSlug(slug: string): string {
  return slug.toLowerCase();
}

/**
 * Normalizes a raw `sayfa` query value into a usable page number. The upper bound
 * keeps a crawler from driving arbitrarily large database offsets.
 */
export function parsePageNumber(value: string | undefined): number {
  if (!value) return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 10_000 ? parsed : 1;
}

/** Inclusive `[from, to]` bounds for a PostgREST `.range()` call. */
export function pageRange(pageNumber: number, pageSize = ARCHIVE_PAGE_SIZE): [number, number] {
  const from = (Math.max(1, pageNumber) - 1) * pageSize;
  return [from, from + pageSize - 1];
}
