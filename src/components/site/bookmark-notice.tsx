"use client";

import { useSearchParams } from "next/navigation";
import { bookmarkNotice } from "@/lib/bookmarks/messages";

/**
 * Girişten dönen okura gösterilen kaydetme bildirimi.
 *
 * `?bilgi=` sunucuda okunsaydı haber sayfası istek zamanlı olurdu; arama parametresi
 * istemcide okununca sayfa gövdesi önbelleğe alınabilir kalıyor. `useSearchParams`
 * bir Suspense sınırı gerektirir — çağıran onu sağlar.
 */
export function BookmarkNotice() {
  const notice = bookmarkNotice(useSearchParams().get("bilgi") ?? undefined);

  if (!notice) return null;

  return (
    <p
      className={`shell-container mt-6 rounded-[18px] px-4 py-3 text-sm ${
        notice.tone === "success"
          ? "bg-[color-mix(in_srgb,var(--color-teal)_12%,white)] text-[var(--color-teal)]"
          : "bg-red-50 text-red-700"
      }`}
      role={notice.tone === "error" ? "alert" : "status"}
    >
      {notice.text}
    </p>
  );
}
