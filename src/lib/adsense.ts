import { env } from "@/lib/env";
import type { AdPlacementKey } from "@/lib/ads";

const slots: Record<AdPlacementKey, string | undefined> = {
  HOME_LEADER: env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_LEADER,
  HOME_INLINE: env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE,
  ARTICLE_MID: env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID,
  ARTICLE_END: env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_END,
};

/** Yayıncı kimliği; yoksa AdSense tümüyle kapalıdır. */
export const adsenseClient = env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const isAdsenseEnabled = Boolean(adsenseClient);

/** Bir yerleşimin AdSense birimi; kimlik veya slot eksikse undefined. */
export function getAdsenseSlot(placement: AdPlacementKey): string | undefined {
  return isAdsenseEnabled ? slots[placement] : undefined;
}
