import type { ArticlePreview, MediaTone } from "@/lib/homepage";

/** Editorial timezone. Pinning it keeps server and client labels identical. */
const TIMEZONE = "Europe/Istanbul";

const timeFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TIMEZONE,
  day: "numeric",
  month: "long",
});

const dayWithYearFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TIMEZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Calendar day in the editorial timezone, as `YYYY-MM-DD`. */
function istanbulDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Same-day articles read better as a clock time, older ones as a date. The
 * year only appears once it differs from today's, the way a newspaper dateline
 * behaves.
 */
export function formatPublishedLabel(publishedAt: string | Date, now: Date = new Date()): string {
  const date = publishedAt instanceof Date ? publishedAt : new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return "";

  const day = istanbulDay(date);
  if (day === istanbulDay(now)) return timeFormatter.format(date);

  return day.slice(0, 4) === istanbulDay(now).slice(0, 4)
    ? dayFormatter.format(date)
    : dayWithYearFormatter.format(date);
}

/** Average Turkish reading pace used across the editorial surface. */
export const WORDS_PER_MINUTE = 200;

export function readingTimeLabel(wordCount: number): string {
  const words = Number.isFinite(wordCount) && wordCount > 0 ? wordCount : 0;
  return `${Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))} dk`;
}

const tonesByTopic: Record<string, MediaTone> = {
  gundem: "sky",
  ekonomi: "sage",
  "kultur-sanat": "ochre",
  yasam: "coral",
};

/**
 * Media placeholders need a stable colour per article. Deriving it from the
 * topic keeps a section visually coherent until real hero images land.
 */
export function topicMediaTone(topicSlug: string | null | undefined): MediaTone {
  return (topicSlug && tonesByTopic[topicSlug]) || "teal";
}

export type ArticlePreviewRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  topic_name: string | null;
  topic_slug: string | null;
  location_name: string | null;
  location_slug: string | null;
  published_at: string | null;
  word_count: number;
};

/**
 * Maps a database row onto the shape the public cards already render.
 * `publishedLabel`, `readingTime` and `mediaTone` are presentation values with
 * no column of their own, so they are derived here rather than stored.
 */
export function toArticlePreview(row: ArticlePreviewRow, now?: Date): ArticlePreview {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? undefined,
    topic: row.topic_name ?? "Haber",
    topicSlug: row.topic_slug ?? "gundem",
    location: row.location_name ?? "Ege",
    publishedLabel: row.published_at ? formatPublishedLabel(row.published_at, now) : "",
    readingTime: readingTimeLabel(row.word_count),
    mediaTone: topicMediaTone(row.topic_slug),
  };
}
