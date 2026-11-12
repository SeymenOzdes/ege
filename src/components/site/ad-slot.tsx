import { adPlacementInfo, type AdPlacementKey } from "@/lib/ads";
import { adsenseClient, getAdsenseSlot } from "@/lib/adsense";
import { getAdForPlacement } from "@/lib/ads-content";
import { AdsenseUnit } from "@/components/site/adsense-unit";
import styles from "./ad-slot.module.css";

/**
 * One advertisement, or nothing. With no live campaign for the placement the slot
 * renders no markup at all, so an empty newsroom shows no holes.
 *
 * The "Reklam" label is permanent: the publishing principles promise that ads are
 * always marked. The frame reserves the banner's size before the image loads so a
 * late creative cannot shift the page.
 */
export async function AdSlot({
  placement,
  compact = false,
}: {
  placement: AdPlacementKey;
  compact?: boolean;
}) {
  const ad = await getAdForPlacement(placement);
  const adsenseSlot = getAdsenseSlot(placement);
  // Anlaşmalı reklam her zaman önce gelir; AdSense yalnızca boş kalan alanı doldurur.
  if (!ad && !(adsenseClient && adsenseSlot)) return null;

  const { desktop, mobile } = adPlacementInfo[placement];
  const rectangle = placement === "ARTICLE_MID" || placement === "ARTICLE_END";
  const classes = [styles.adSlot, compact && styles.compact, rectangle && styles.article]
    .filter(Boolean)
    .join(" ");

  if (!ad && adsenseClient && adsenseSlot) {
    // AdSense: çerçeve ve etiket istemci tarafında, izin verildiğinde çizilir;
    // izin yokken sayfada "Reklam" yazan boş bir etiket kalmasın diye.
    return (
      <AdsenseUnit
        asideClassName={classes}
        creativeClassName={styles.creative}
        labelClassName={styles.label}
        client={adsenseClient}
        slot={adsenseSlot}
        placement={placement}
        maxWidth={desktop.width}
        minHeight={mobile.height}
      />
    );
  }
  if (!ad) return null;

  return (
    <aside className={classes} aria-label="Reklam" data-ad-placement={placement}>
      <span className={styles.label}>Reklam</span>
      {/* Dış bağlantı: `sponsored` arama motorlarına bunun ücretli olduğunu söyler. */}
      <a
        className={styles.creative}
        href={ad.destinationUrl}
        rel="sponsored noopener noreferrer"
        target="_blank"
        style={{ maxWidth: `${desktop.width}px` }}
      >
        <picture>
          <source media="(max-width: 767px)" srcSet={ad.mobileSrc} />
          <img
            alt={`${ad.sponsor} reklamı`}
            height={desktop.height}
            loading="lazy"
            src={ad.desktopSrc}
            width={desktop.width}
            style={{ ["--mobile-ratio" as string]: `${mobile.width} / ${mobile.height}` }}
          />
        </picture>
      </a>
    </aside>
  );
}
