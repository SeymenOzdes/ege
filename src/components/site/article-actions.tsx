"use client";

import { useState } from "react";
import { ShareNetwork } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import styles from "./article-detail.module.css";

type ArticleActionsProps = {
  title: string;
};

/**
 * Haber detay sayfasındaki paylaş düğmesi.
 *
 * Paylaşım adresi tarayıcıdaki güncel konumdan okunuyor.
 */
export function ArticleActions({ title }: ArticleActionsProps) {
  const [status, setStatus] = useState("");

  async function shareArticle() {
    const shareData = { title, text: title, url: window.location.href };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setStatus("Paylaşım menüsü açıldı.");
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setStatus("Haber bağlantısı kopyalandı.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("Bağlantı kopyalanamadı.");
    }
  }

  return (
    <div className={styles.actionsWrap}>
      <div className={styles.actions} aria-label="Haber işlemleri">
        <button type="button" onClick={shareArticle} aria-label="Haberi paylaş">
          <ShareNetwork aria-hidden="true" size={19} weight="bold" />
          <span>Paylaş</span>
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
