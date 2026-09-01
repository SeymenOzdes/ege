export type MediaTone = "teal" | "ochre" | "ink" | "sky" | "sage" | "coral";

export type ArticlePreview = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  topic: string;
  topicSlug: string;
  location: string;
  publishedLabel: string;
  readingTime: string;
  mediaTone: MediaTone;
};

export type FeaturedStory = ArticlePreview & {
  kicker: string;
};

export type TopicSection = {
  name: string;
  slug: string;
  lead: ArticlePreview;
  stories: ArticlePreview[];
};

export type HomepageContent = {
  /** Null when no unexpired breaking story exists; the ribbon is then hidden. */
  breakingNews: ArticlePreview | null;
  featured: FeaturedStory[];
  secondary: ArticlePreview[];
  latest: ArticlePreview[];
  topicSections: TopicSection[];
  loadError: boolean;
};

/**
 * This module stays free of `server-only` and of Supabase imports on purpose:
 * it is where every surface — including the `"use client"` carousel — reads the
 * shared card types from. The queries live in `@/lib/homepage-content`.
 */

/** Featured + secondary + latest all come from one ordered read of the feed. */
export const FEATURED_COUNT = 3;
export const SECONDARY_COUNT = 2;
export const LATEST_COUNT = 6;
export const HOMEPAGE_FEED_LIMIT = FEATURED_COUNT + SECONDARY_COUNT + LATEST_COUNT;

/** A topic section renders a lead plus two side stories; with fewer it is dropped. */
export const TOPIC_SECTION_COUNT = 4;
export const TOPIC_SECTION_SIZE = 3;

export const emptyHomepageContent: HomepageContent = {
  breakingNews: null,
  featured: [],
  secondary: [],
  latest: [],
  topicSections: [],
  loadError: false,
};

export type TopicGroup = {
  name: string;
  slug: string;
  articles: ArticlePreview[];
};

/**
 * The homepage has no curation table yet, so the front page is composed from
 * publication order: the newest stories fill the hero, then the secondary rail,
 * then the timeline. Keeping this pure — the queries hand it plain arrays — makes
 * the slot arithmetic testable without a database.
 */
export function composeHomepage(
  feed: ArticlePreview[],
  breakingNews: ArticlePreview | null,
  topicGroups: TopicGroup[],
): HomepageContent {
  const featured = feed.slice(0, FEATURED_COUNT).map((article) => ({
    ...article,
    // Without a curated kicker column the topic name is the honest label.
    kicker: article.topic,
  }));

  return {
    breakingNews,
    featured,
    secondary: feed.slice(FEATURED_COUNT, FEATURED_COUNT + SECONDARY_COUNT),
    latest: feed.slice(FEATURED_COUNT + SECONDARY_COUNT, HOMEPAGE_FEED_LIMIT),
    topicSections: topicGroups
      // A section without a lead and two stories would render half-empty.
      .filter((group) => group.articles.length >= TOPIC_SECTION_SIZE)
      .map((group) => ({
        name: group.name,
        slug: group.slug,
        lead: group.articles[0],
        stories: group.articles.slice(1, TOPIC_SECTION_SIZE),
      })),
    loadError: false,
  };
}
