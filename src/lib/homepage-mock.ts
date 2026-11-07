import { FEATURED_COUNT, type HomepageContent } from "@/lib/homepage";
import { MOCK_NEWS_STORIES, mockNewsFeatured, withMockHero } from "@/lib/mock-news";

/**
 * Preview only: pads the hero carousel with placeholder slides until the feed holds
 * enough real stories, then fills any still-colourless card with a preview photo.
 * Callers must not use this in production.
 */
export function padFeaturedWithMock(content: HomepageContent): HomepageContent {
  const missing = FEATURED_COUNT - content.featured.length;
  if (missing <= 0) return content;

  const mocks = Array.from({ length: missing }, (_, index) =>
    mockNewsFeatured(MOCK_NEWS_STORIES[index % MOCK_NEWS_STORIES.length]),
  );

  return { ...content, featured: [...content.featured, ...mocks] };
}

/**
 * Preview only: gives every card a photograph. Stories from the seed feed keep
 * their matching local photo; the rest keep their colour surface when nothing
 * fits. The same helper backs the detail pages, so a card and the page it opens
 * never disagree about the picture.
 */
export function fillMockHeroes(content: HomepageContent): HomepageContent {
  return {
    ...content,
    breakingNews: content.breakingNews ? withMockHero(content.breakingNews) : null,
    featured: content.featured.map(withMockHero),
    secondary: content.secondary.map(withMockHero),
    latest: content.latest.map(withMockHero),
    topicSections: content.topicSections.map((section) => ({
      ...section,
      lead: withMockHero(section.lead),
      stories: section.stories.map(withMockHero),
    })),
  };
}

/** Applies the full development preview in one call. */
export function withPreviewContent(content: HomepageContent): HomepageContent {
  return fillMockHeroes(padFeaturedWithMock(content));
}
