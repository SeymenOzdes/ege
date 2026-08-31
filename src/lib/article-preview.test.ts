import { describe, expect, it } from "vitest";
import {
  WORDS_PER_MINUTE,
  countWords,
  formatPublishedLabel,
  readingTimeLabel,
  toArticlePreview,
  topicMediaTone,
} from "@/lib/article-preview";

// All expectations are anchored to Europe/Istanbul, the editorial timezone.
const now = new Date("2026-08-27T12:00:00+03:00");

describe("formatPublishedLabel", () => {
  it("shows a clock time for articles published today", () => {
    expect(formatPublishedLabel("2026-08-27T09:42:00+03:00", now)).toBe("09:42");
  });

  it("shows a day and month for earlier articles in the same year", () => {
    expect(formatPublishedLabel("2026-08-18T08:37:00+03:00", now)).toBe("18 Ağustos");
  });

  it("adds the year once it differs from today", () => {
    expect(formatPublishedLabel("2025-12-31T23:30:00+03:00", now)).toBe("31 Aralık 2025");
  });

  it("uses the editorial timezone rather than the host timezone", () => {
    // 23:30 UTC is already the next day in Istanbul.
    expect(formatPublishedLabel("2026-08-26T23:30:00Z", now)).toBe("02:30");
  });

  it("returns an empty label for unparseable input", () => {
    expect(formatPublishedLabel("not-a-date", now)).toBe("");
  });
});

describe("readingTimeLabel", () => {
  it("rounds up to whole minutes", () => {
    expect(readingTimeLabel(200)).toBe("1 dk");
    expect(readingTimeLabel(201)).toBe("2 dk");
    expect(readingTimeLabel(801)).toBe("5 dk");
  });

  it("never reports less than a minute", () => {
    expect(readingTimeLabel(0)).toBe("1 dk");
    expect(readingTimeLabel(-5)).toBe("1 dk");
    expect(readingTimeLabel(Number.NaN)).toBe("1 dk");
  });
});

describe("topicMediaTone", () => {
  it("gives each seeded topic a stable tone", () => {
    expect(topicMediaTone("ekonomi")).toBe("sage");
    expect(topicMediaTone("kultur-sanat")).toBe("ochre");
  });

  it("falls back for unknown or missing topics", () => {
    expect(topicMediaTone("bilinmeyen")).toBe("teal");
    expect(topicMediaTone(null)).toBe("teal");
  });
});

describe("toArticlePreview", () => {
  const row = {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "zeytinin-yeni-hasat-hikayesi",
    title: "Zeytinin yeni hasat hikâyesi",
    summary: "Küçük üreticiler yerel çeşitleri koruyor.",
    topic_name: "Ekonomi",
    topic_slug: "ekonomi",
    location_name: "Aydın",
    location_slug: "aydin",
    published_at: "2026-08-27T09:18:00+03:00",
    word_count: 340,
  };

  it("derives the presentation-only fields the cards render", () => {
    expect(toArticlePreview(row, now)).toEqual({
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      topic: "Ekonomi",
      topicSlug: "ekonomi",
      location: "Aydın",
      publishedLabel: "09:18",
      readingTime: "2 dk",
      mediaTone: "sage",
    });
  });

  it("keeps a usable card when optional relations are missing", () => {
    const preview = toArticlePreview(
      {
        ...row,
        summary: null,
        topic_name: null,
        topic_slug: null,
        location_name: null,
        published_at: null,
      },
      now,
    );

    expect(preview.summary).toBeUndefined();
    expect(preview.topic).toBe("Haber");
    expect(preview.location).toBe("Ege");
    expect(preview.publishedLabel).toBe("");
    expect(preview.mediaTone).toBe("teal");
  });
});

describe("countWords", () => {
  it("counts whitespace-separated words", () => {
    expect(countWords("Ege bölgesinden üç haber")).toBe(4);
  });

  it("ignores leading, trailing and repeated whitespace", () => {
    expect(countWords("  iki\n\n  kelime  ")).toBe(2);
  });

  it("returns zero for empty and missing bodies", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
  });

  it("agrees with readingTimeLabel on the words-per-minute boundary", () => {
    const body = Array.from({ length: WORDS_PER_MINUTE }, () => "kelime").join(" ");
    expect(countWords(body)).toBe(WORDS_PER_MINUTE);
    expect(readingTimeLabel(countWords(body))).toBe("1 dk");
  });
});
