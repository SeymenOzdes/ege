import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/search";
import { normalizeSearchQuery } from "@/lib/search-query";

/** Typeahead source for the header search panel. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { query, state } = normalizeSearchQuery(url.searchParams.get("q"));

  if (state !== "ok") return NextResponse.json({ results: [] });

  const { hits, loadError } = await searchArticles({
    query,
    topicSlug: url.searchParams.get("konu"),
    locationSlug: url.searchParams.get("sehir"),
    pageSize: 5,
  });

  if (loadError) return NextResponse.json({ results: [] }, { status: 503 });

  return NextResponse.json({
    results: hits.map(({ id, slug, title, topic, location, publishedLabel }) => ({
      id,
      slug,
      title,
      topic,
      location,
      publishedLabel,
      href: `/haber/${slug}`,
    })),
  });
}
