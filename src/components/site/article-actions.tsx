"use client";

import { useState } from "react";
import { BookmarkSimple } from "@phosphor-icons/react/dist/csr/BookmarkSimple";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { ShareNetwork } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import styles from "./article-detail.module.css";

export function ArticleActions({ title }: { title: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  async function shareArticle() {
    const shareData = { title, text: title, url: window.location.href };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Paylaşım menüsü açıldı.");
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("Haber bağlantısı kopyalandı.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("Bağlantı kopyalanamadı.");
    }
  }

  return (
    <div className={styles.actionsWrap}>
      <div className={styles.actions} aria-label="Haber işlemleri">
        <button type="button" onClick={shareArticle} aria-label="Haberi paylaş">
          <ShareNetwork aria-hidden="true" size={19} weight="bold" />
          <span>Paylaş</span>
        </button>
        <button
          type="button"
          aria-label={isSaved ? "Haberi kaydedilenlerden çıkar" : "Haberi kaydet"}
          aria-pressed={isSaved}
          onClick={() => setIsSaved((current) => !current)}
        >
          {isSaved ? (
            <Check aria-hidden="true" size={19} weight="bold" />
          ) : (
            <BookmarkSimple aria-hidden="true" size={19} weight="bold" />
          )}
          <span>{isSaved ? "Kaydedildi" : "Kaydet"}</span>
        </button>
      </div>
      <p className={styles.actionNote}>Kaydetme durumu bu örnek oturumla sınırlıdır.</p>
      <p className="sr-only" aria-live="polite">
        {shareStatus}
      </p>
    </div>
  );
}
