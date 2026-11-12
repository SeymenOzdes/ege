"use client";

import Link from "next/link";
import { setAdConsent, useAdConsent } from "@/lib/ad-consent";
import { isAdsenseEnabled } from "@/lib/adsense";
import styles from "./ad-consent-banner.module.css";

/**
 * Reklam çerezi izni. Yalnızca AdSense açıkken ve okur henüz seçim yapmamışken
 * görünür; "Reddet" ve "Kabul et" aynı ağırlıkta, reddetmek kabul etmek kadar kolay.
 */
export function AdConsentBanner() {
  const consent = useAdConsent();
  if (!isAdsenseEnabled || consent !== "unset") return null;

  return (
    <section className={styles.banner} aria-label="Reklam çerezi tercihi" role="region">
      <p>
        Sitede reklam gösterilir. Kabul ederseniz Google, size uygun reklam göstermek için çerez
        kullanır. Reddederseniz reklam gösterilmez; haberleri okumaya devam edersiniz.{" "}
        <Link href="/cerezler">Çerez Politikası</Link>
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={() => setAdConsent("denied")}>
          Reddet
        </button>
        <button type="button" onClick={() => setAdConsent("granted")}>
          Kabul et
        </button>
      </div>
    </section>
  );
}

/** Altbilgideki "Reklam tercihleri" bağlantısı: verilen izni geri almanın yolu. */
export function AdConsentReset() {
  const consent = useAdConsent();
  if (!isAdsenseEnabled || consent === "unset") return null;

  return (
    <button type="button" onClick={() => setAdConsent("unset")}>
      Reklam tercihleri
    </button>
  );
}
