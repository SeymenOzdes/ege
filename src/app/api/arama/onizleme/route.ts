import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/search";
import { normalizeSearchQuery } from "@/lib/search-query";

/**
 * Typeahead responses are shared across every visitor typing the same prefix,
 * so the CDN can answer most of them. `search_published_articles` runs
 * `ts_headline`, which its own SQL comment flags as expensive — this route is
 * public, so a cache miss is the only path that should reach the database.
 */
const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

/** Per-IP allowance, and the window it refills over. */
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

/**
 * Fixed-window counter per client address. In-process, so it only bounds the
 * instance it runs on — it is a floor under a public, uncached-path endpoint,
 * not a substitute for an edge rate limit if this ever needs one.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-for");
  const client = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();

  const window = hits.get(client);
  if (window === undefined || now >= window.resetAt) {
    // Sweep expired windows on write so the map cannot grow without bound.
    for (const [key, value] of hits) {
      if (now >= value.resetAt) hits.delete(key);
    }
    hits.set(client, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  window.count += 1;
  return window.count > RATE_LIMIT;
}

/** Typeahead source for the header search panel. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { query, state } = normalizeSearchQuery(url.searchParams.get("q"));

  if (state !== "ok") {
    return NextResponse.json({ results: [] }, { headers: { "Cache-Control": CACHE_CONTROL } });
  }

  if (isRateLimited(request)) {
    return NextResponse.json(
      { results: [] },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(Math.ceil(RATE_WINDOW_MS / 1000)),
        },
      },
    );
  }

  const { hits: results, loadError } = await searchArticles({
    query,
    topicSlug: url.searchParams.get("konu"),
    locationSlug: url.searchParams.get("sehir"),
    pageSize: 5,
  });

  // A transient backend failure must not be cached in front of the next request.
  if (loadError) {
    return NextResponse.json(
      { results: [] },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      results: results.map(({ id, slug, title, topic, location, publishedLabel }) => ({
        id,
        slug,
        title,
        topic,
        location,
        publishedLabel,
        href: `/haber/${slug}`,
      })),
    },
    { headers: { "Cache-Control": CACHE_CONTROL } },
  );
}
