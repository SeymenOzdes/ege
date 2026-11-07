import { NextResponse } from "next/server";
import { z } from "zod";
import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

/**
 * Records one read of an article.
 *
 * The article pages are cached for five minutes, so a count taken while the page
 * renders would only see one visit per cache regeneration — not per reader. The
 * page therefore beacons here from the browser and the database does the
 * increment (`record_article_view`), which keeps the "En Çok Okunanlar" ranking
 * a measure of readers rather than of cache misses.
 *
 * The route never reports whether the slug exists: it is a public write path,
 * and a 404 for a published-but-unknown slug would turn it into a probe.
 */

/** Per-IP allowance, and the window it refills over. A reader can open a handful
 *  of stories a minute; the ceiling is here to bound a script, not a person. */
const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;

const bodySchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

/**
 * Fixed-window counter per client address, in-process like the search typeahead's.
 * It bounds this instance only; a distributed deployment would need an edge limit.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-for");
  const client = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();

  const window = hits.get(client);
  if (window === undefined || now >= window.resetAt) {
    for (const [key, value] of hits) {
      if (now >= value.resetAt) hits.delete(key);
    }
    hits.set(client, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  window.count += 1;
  return window.count > RATE_LIMIT;
}

function noContent() {
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return new NextResponse(null, {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(Math.ceil(RATE_WINDOW_MS / 1000)),
      },
    });
  }

  // Local development without a database still renders the site; there is simply
  // nothing to count, and the browser should not see an error for it.
  if (!hasSupabasePublicConfig()) return noContent();

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const supabase = createAnonClient();
  const { error } = await supabase.rpc("record_article_view", { p_slug: parsed.data.slug });

  if (error) {
    // A failed counter is not worth breaking a reader's page over, but it should
    // still leave a trace for the operator.
    console.error("Okunma sayacı güncellenemedi:", error.message);
  }

  return noContent();
}
