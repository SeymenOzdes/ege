import type { ArticlePreview } from "@/lib/homepage";
import { allPreviewArticles } from "@/lib/homepage";
import { normalizeTurkish } from "@/lib/turkish";

export { normalizeTurkish };

function articleHaystack(article: ArticlePreview): string {
  return normalizeTurkish(
    [article.title, article.summary ?? "", article.topic, article.location].join(" "),
  );
}

const haystacks = new Map<string, string>(
  allPreviewArticles.map((article) => [article.id, articleHaystack(article)]),
);

export type SearchHit = ArticlePreview & { matchedIn: "title" | "summary" | "meta" };

/**
 * Full-text style search over the article catalog with Turkish normalization.
 * Every query token must appear somewhere in the article; ranking favors
 * title matches, then summaries, then topic/location metadata.
 */
export function searchArticles(query: string): SearchHit[] {
  const tokens = normalizeTurkish(query).split(" ").filter(Boolean);

  if (tokens.length === 0) return [];

  const hits: Array<{ article: ArticlePreview; score: number; matchedIn: SearchHit["matchedIn"] }> =
    [];

  for (const article of allPreviewArticles) {
    const haystack = haystacks.get(article.id) ?? "";
    if (!tokens.every((token) => haystack.includes(token))) continue;

    const normalizedTitle = normalizeTurkish(article.title);
    const normalizedSummary = normalizeTurkish(article.summary ?? "");

    let score = 0;
    let matchedIn: SearchHit["matchedIn"] = "meta";
    if (tokens.every((token) => normalizedTitle.includes(token))) {
      score = 3;
      matchedIn = "title";
    } else if (tokens.some((token) => normalizedTitle.includes(token))) {
      score = 2;
      matchedIn = "title";
    } else if (normalizedSummary && tokens.some((token) => normalizedSummary.includes(token))) {
      score = 1;
      matchedIn = "summary";
    }

    hits.push({ article, score, matchedIn });
  }

  return hits
    .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title, "tr"))
    .map(({ article, matchedIn }) => ({ ...article, matchedIn }));
}