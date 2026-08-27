import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/search";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";

  if (query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = searchArticles(query)
    .slice(0, 5)
    .map(({ id, slug, title, topic, location, publishedLabel }) => ({
      id,
      slug,
      title,
      topic,
      location,
      publishedLabel,
      href: `/haber/${slug}`,
    }));

  return NextResponse.json({ results });
}