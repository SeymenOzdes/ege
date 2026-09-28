"use client";

import { useEffect } from "react";
import { FeedNotice } from "@/components/site/feed-notice";

/**
 * Public sayfalar için hata sınırı. Header ve footer yerinde kalır; yalnızca sayfa
 * gövdesi duyuruyla değişir. Ana sayfa buraya ancak önbellekte hiç sağlam sürüm
 * yokken düşer — bkz. `(site)/page.tsx`.
 */
export default function SiteError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <FeedNotice headingLevel="h1" standalone />;
}
