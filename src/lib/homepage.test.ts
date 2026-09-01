import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_FEED_LIMIT,
  TOPIC_SECTION_SIZE,
  composeHomepage,
  type TopicGroup,
} from "@/lib/homepage";
import { makePreview, makePreviews } from "@/test/previews";

function topicGroup(name: string, slug: string, articleCount: number): TopicGroup {
  return { name, slug, articles: makePreviews(articleCount) };
}

describe("composeHomepage", () => {
  it("fills the hero, secondary rail and timeline from publication order", () => {
    const feed = makePreviews(HOMEPAGE_FEED_LIMIT);

    const content = composeHomepage(feed, null, []);

    expect(content.featured.map((story) => story.slug)).toEqual([
      "haber-1",
      "haber-2",
      "haber-3",
    ]);
    expect(content.secondary.map((story) => story.slug)).toEqual(["haber-4", "haber-5"]);
    expect(content.latest).toHaveLength(6);
    expect(content.latest[0].slug).toBe("haber-6");
    expect(content.loadError).toBe(false);
  });

  it("labels each featured story with its own topic as the kicker", () => {
    const feed = [
      makePreview(1, { topic: "Ekonomi" }),
      makePreview(2, { topic: "Kültür-Sanat" }),
      makePreview(3, { topic: "Yaşam" }),
    ];

    expect(composeHomepage(feed, null, []).featured.map((story) => story.kicker)).toEqual([
      "Ekonomi",
      "Kültür-Sanat",
      "Yaşam",
    ]);
  });

  it("degrades to whatever the feed holds instead of padding empty slots", () => {
    const content = composeHomepage(makePreviews(2), null, []);

    expect(content.featured).toHaveLength(2);
    expect(content.secondary).toEqual([]);
    expect(content.latest).toEqual([]);
  });

  it("drops topic sections that cannot fill a lead and two side stories", () => {
    const content = composeHomepage(makePreviews(HOMEPAGE_FEED_LIMIT), null, [
      topicGroup("Gündem", "gundem", TOPIC_SECTION_SIZE),
      topicGroup("Ekonomi", "ekonomi", TOPIC_SECTION_SIZE - 1),
      topicGroup("Yaşam", "yasam", TOPIC_SECTION_SIZE + 4),
    ]);

    expect(content.topicSections.map((section) => section.slug)).toEqual(["gundem", "yasam"]);
    // A section shows its newest story as the lead and the next two beside it.
    expect(content.topicSections[0].lead.slug).toBe("haber-1");
    expect(content.topicSections[0].stories.map((story) => story.slug)).toEqual([
      "haber-2",
      "haber-3",
    ]);
    expect(content.topicSections[1].stories).toHaveLength(2);
  });

  it("carries a breaking story through, and tolerates its absence", () => {
    const breaking = makePreview(99, { title: "Körfez hattında ilk seferler başladı" });

    expect(composeHomepage(makePreviews(3), breaking, []).breakingNews).toEqual(breaking);
    expect(composeHomepage(makePreviews(3), null, []).breakingNews).toBeNull();
  });
});
