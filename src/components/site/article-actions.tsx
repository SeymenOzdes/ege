"use client";

import { startTransition, useEffect, useOptimistic, useState } from "react";
import { BookmarkSimple } from "@phosphor-icons/react/dist/csr/BookmarkSimple";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { ShareNetwork } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { SignIn } from "@phosphor-icons/react/dist/csr/SignIn";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { startBookmarkLogin, toggleBookmark } from "@/lib/bookmarks/actions";
import { bookmarkErrorText } from "@/lib/bookmarks/messages";
import { createClient } from "@/lib/supabase/client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import styles from "./article-detail.module.css";

type ArticleActionsProps = {
  title: string;
  slug: string;
};

/**
 * Paylaş ve kaydet düğmeleri.
 *
 * Oturum ve kayıt durumu sunucudan prop olarak gelmiyor; ikisi de çerez okuması
 * demekti ve haber sayfasını her istekte yeniden render ettiriyordu. Artık tarayıcıda
 * çözülüyor: sayfa gövdesi önbelleğe alınabilir kalıyor, düğme ilk boyamada
 * "Kaydet" görünüp durumu bir tık sonra yerine oturuyor.
 */
export function ArticleActions({ title, slug }: ArticleActionsProps) {
  const { user } = useCurrentUser();
  const isSignedIn = Boolean(user);
  const [saved, setSaved] = useState(false);
  // İyimser değer, eylem sonuçlandığında `saved`'e geri düşer. Başarısız bir
  // kaydetmede `saved` hiç değişmediği için geri alma kendiliğinden olur.
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [status, setStatus] = useState("");

  // Kayıt durumu yalnız oturum açmış okur için sorulur. Sorgu `articles` üzerinden
  // kurulur, `bookmarks` üzerinden değil: süzgeç böylece gömülü kaynağın takma adına
  // değil üst tablonun kendi sütununa uygulanır. `bookmarks_select_own` satırları
  // zaten okurun kendisine daraltıyor.
  useEffect(() => {
    if (!isSignedIn || !hasSupabasePublicConfig()) return;

    let active = true;
    void createClient()
      .from("articles")
      .select("id, bookmarks(article_id)")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setSaved((data?.bookmarks?.length ?? 0) > 0);
      });

    return () => {
      active = false;
    };
  }, [isSignedIn, slug]);

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

  const buttons = (
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
  );

  return (
    <div className={styles.actionsWrap}>
      {buttons}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
