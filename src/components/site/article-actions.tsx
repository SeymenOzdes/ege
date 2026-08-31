"use client";

import { startTransition, useOptimistic, useState } from "react";
import { BookmarkSimple } from "@phosphor-icons/react/dist/csr/BookmarkSimple";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { ShareNetwork } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { SignIn } from "@phosphor-icons/react/dist/csr/SignIn";
import { startBookmarkLogin, toggleBookmark } from "@/lib/bookmarks/actions";
import { bookmarkErrorText } from "@/lib/bookmarks/messages";
import styles from "./article-detail.module.css";

type ArticleActionsProps = {
  title: string;
  slug: string;
  initialSaved: boolean;
  isSignedIn: boolean;
};

export function ArticleActions({ title, slug, initialSaved, isSignedIn }: ArticleActionsProps) {
  const [saved, setSaved] = useState(initialSaved);
  // İyimser değer, eylem sonuçlandığında `saved`'e geri düşer. Başarısız bir
  // kaydetmede `saved` hiç değişmediği için geri alma kendiliğinden olur.
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
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

  function toggleSaved() {
    const next = !saved;

    startTransition(async () => {
      setOptimisticSaved(next);
      const result = await toggleBookmark(slug, next);

      if (result.saved === undefined) {
        setStatus(bookmarkErrorText(result.error));
        return;
      }

      setSaved(result.saved);
      setStatus(result.saved ? "Haber kaydedildi." : "Haber kaydedilenlerden çıkarıldı.");
    });
  }

  return (
    <div className={styles.actionsWrap}>
      <div className={styles.actions} aria-label="Haber işlemleri">
        <button type="button" onClick={shareArticle} aria-label="Haberi paylaş">
          <ShareNetwork aria-hidden="true" size={19} weight="bold" />
          <span>Paylaş</span>
        </button>

        {isSignedIn ? (
          <button
            type="button"
            aria-label={optimisticSaved ? "Haberi kaydedilenlerden çıkar" : "Haberi kaydet"}
            aria-pressed={optimisticSaved}
            onClick={toggleSaved}
          >
            {optimisticSaved ? (
              <Check aria-hidden="true" size={19} weight="bold" />
            ) : (
              <BookmarkSimple aria-hidden="true" size={19} weight="bold" />
            )}
            <span>{optimisticSaved ? "Kaydedildi" : "Kaydet"}</span>
          </button>
        ) : (
          // JavaScript olmadan da çalışsın diye düz bir form: sunucu eylemi
          // hedef haberi çereze yazıp girişe yönlendirir.
          <form action={startBookmarkLogin.bind(null, slug)}>
            <button type="submit" aria-label="Haberi kaydetmek için giriş yap">
              <SignIn aria-hidden="true" size={19} weight="bold" />
              <span>Kaydet</span>
            </button>
          </form>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
