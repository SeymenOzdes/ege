import type { Database } from "@/lib/supabase/database.types";

/** Same values as the `ad_placement_key` enum in the database. */
export type AdPlacementKey = Database["public"]["Enums"]["ad_placement_key"];

export const adPlacementKeys = [
  "HOME_LEADER",
  "HOME_INLINE",
  "ARTICLE_MID",
  "ARTICLE_END",
] as const satisfies readonly AdPlacementKey[];

/**
 * What each slot is called in the admin and the banner size it is designed for.
 * The slot reserves `desktop`'s aspect ratio up front, so a banner of another
 * shape gets letterboxed rather than shifting the page.
 */
export const adPlacementInfo: Record<
  AdPlacementKey,
  {
    label: string;
    where: string;
    desktop: { width: number; height: number };
    mobile: { width: number; height: number };
  }
> = {
  HOME_LEADER: {
    label: "Ana sayfa, üst bant",
    where: "En çok okunanların altında, geniş bant",
    desktop: { width: 970, height: 120 },
    mobile: { width: 320, height: 100 },
  },
  HOME_INLINE: {
    label: "Ana sayfa, alt bant",
    where: "Bülten kutusunun altında, geniş bant",
    desktop: { width: 970, height: 120 },
    mobile: { width: 320, height: 100 },
  },
  ARTICLE_MID: {
    label: "Haber içi",
    where: "Uzun haberlerde ikinci bloktan sonra, dikdörtgen",
    desktop: { width: 300, height: 250 },
    mobile: { width: 300, height: 250 },
  },
  ARTICLE_END: {
    label: "Haber sonu",
    where: "Haberin altında, “Okumaya devam”ın üstünde, dikdörtgen",
    desktop: { width: 300, height: 250 },
    mobile: { width: 300, height: 250 },
  },
};

export function isAdPlacementKey(value: unknown): value is AdPlacementKey {
  return typeof value === "string" && (adPlacementKeys as readonly string[]).includes(value);
}

/** A live campaign resolved into what the slot needs to draw it. */
export type AdCreative = {
  id: string;
  sponsor: string;
  destinationUrl: string;
  desktopSrc: string;
  mobileSrc: string;
};
