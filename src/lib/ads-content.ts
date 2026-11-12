import "server-only";

import type { AdCreative, AdPlacementKey } from "@/lib/ads";
import { getMediaPublicUrl } from "@/lib/media";
import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

/**
 * The campaign to show in one slot, or null for "leave the slot out".
 *
 * `ad_placements_public_select` already hides inactive and out-of-window rows, so
 * no date filter is repeated here. Like the other public readers this never
 * throws: an ad that cannot load must not take the article down with it.
 */
export async function getAdForPlacement(placement: AdPlacementKey): Promise<AdCreative | null> {
  if (!hasSupabasePublicConfig()) return null;

  const { data, error } = await createAnonClient()
    .from("ad_placements")
    .select(
      `id, sponsor, destination_url,
       desktop:media_assets!ad_placements_desktop_media_id_fkey(object_path),
       mobile:media_assets!ad_placements_mobile_media_id_fkey(object_path)`,
    )
    .eq("placement_key", placement)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const desktopSrc = data.desktop ? getMediaPublicUrl(data.desktop.object_path) : undefined;
  const mobileSrc = data.mobile ? getMediaPublicUrl(data.mobile.object_path) : undefined;
  // A campaign needs at least one picture; either one stands in for the other.
  const fallback = desktopSrc ?? mobileSrc;
  if (!fallback) return null;

  return {
    id: data.id,
    sponsor: data.sponsor,
    destinationUrl: data.destination_url,
    desktopSrc: desktopSrc ?? fallback,
    mobileSrc: mobileSrc ?? fallback,
  };
}
