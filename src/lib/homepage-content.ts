import "server-only";

import {
  ARTICLE_PREVIEW_SELECTION,
  articleRowToPreview,
  type ArticleJoinRow,
} from "@/lib/article-preview";
import {
  HOMEPAGE_FEED_LIMIT,
  TOPIC_SECTION_COUNT,
  TOPIC_SECTION_SIZE,
  composeHomepage,
  emptyHomepageContent,
  type HomepageContent,
} from "@/lib/homepage";
import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

/**
 * Reads the public front page.
 *
 * `articles_public_select` already restricts every row to published, non-archived
 * articles whose `published_at` has passed, so no status filter is repeated here.
 * Like the search and bookmark adapters this never throws: a failed query surfaces
 * as `loadError` so the page renders its error state instead of crashing the route.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  if (!hasSupabasePublicConfig()) return { ...emptyHomepageContent, loadError: true };

  const supabase = createAnonClient();

  const [feed, breaking, topics] = await Promise.all([
    supabase
      .from("articles")
      .select(ARTICLE_PREVIEW_SELECTION)
      .order("published_at", { ascending: false })
      .limit(HOMEPAGE_FEED_LIMIT),
    // A null `breaking_expires_at` is an open-ended alert; a past one has retired.
    supabase
      .from("articles")
      .select(ARTICLE_PREVIEW_SELECTION)
      .eq("is_breaking", true)
      .or(`breaking_expires_at.is.null,breaking_expires_at.gt.${new Date().toISOString()}`)
      .order("published_at", { ascending: false })
      .limit(1),
    supabase
      .from("topics")
      .select("id, name, slug")
      .order("sort_order", { ascending: true })
      .limit(TOPIC_SECTION_COUNT),
  ]);

  if (feed.error || breaking.error || topics.error) {
    return { ...emptyHomepageContent, loadError: true };
  }

  const topicRows = topics.data ?? [];
  const sections = await Promise.all(
    topicRows.map((topic) =>
      supabase
        .from("articles")
        .select(ARTICLE_PREVIEW_SELECTION)
        .eq("topic_id", topic.id)
        .order("published_at", { ascending: false })
        .limit(TOPIC_SECTION_SIZE),
    ),
  );

  if (sections.some((section) => section.error)) {
    return { ...emptyHomepageContent, loadError: true };
  }

  // One clock for the whole page keeps "today" consistent across every label.
  const now = new Date();
  const toPreviews = (rows: ArticleJoinRow[] | null) =>
    (rows ?? []).map((row) => articleRowToPreview(row, now));

  return composeHomepage(
    toPreviews(feed.data),
    toPreviews(breaking.data)[0] ?? null,
    topicRows.map((topic, index) => ({
      name: topic.name,
      slug: topic.slug,
      articles: toPreviews(sections[index].data),
    })),
  );
}
