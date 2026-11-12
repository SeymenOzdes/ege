"use client";

import { useEffect, useRef } from "react";
import { useAdConsent } from "@/lib/ad-consent";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const SCRIPT_ID = "adsense-script";

function loadAdsenseScript(client: string) {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  document.head.appendChild(script);
}

/**
 * Bir AdSense reklam birimi. Google'ın betiği ve çerezleri yalnızca okur reklam
 * çerezlerine izin verdikten sonra yüklenir; izin yoksa hiçbir şey çizilmez.
 */
export function AdsenseUnit({
  client,
  slot,
  placement,
  maxWidth,
  minHeight,
  asideClassName,
  creativeClassName,
  labelClassName,
}: {
  client: string;
  slot: string;
  placement: string;
  maxWidth: number;
  minHeight: number;
  asideClassName: string;
  creativeClassName: string;
  labelClassName: string;
}) {
  const consent = useAdConsent();
  const pushed = useRef(false);

  useEffect(() => {
    if (consent !== "granted" || pushed.current) return;
    pushed.current = true;
    loadAdsenseScript(client);
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Reklam engelleyici veya betik hatası: alan boş kalır, sayfa etkilenmez.
    }
  }, [client, consent]);

  if (consent !== "granted") return null;

  return (
    <aside className={asideClassName} aria-label="Reklam" data-ad-placement={placement}>
      <span className={labelClassName}>Reklam</span>
      <div className={creativeClassName} style={{ maxWidth }}>
        <ins
          className="adsbygoogle"
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
          style={{ display: "block", width: "100%", minHeight }}
        />
      </div>
    </aside>
  );
}
