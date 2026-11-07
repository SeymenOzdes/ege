"use client";

import { useEffect } from "react";

/**
 * Reports one read of this article to `POST /api/goruntuleme`.
 *
 * The article page is cached, so the counter cannot be bumped while it renders.
 * This runs in the browser instead, once per article per tab session: a reload
 * is the same reader, and a new tab is a new visit.
 */
const SEEN_PREFIX = "ege-goruntuleme:";

export function ArticleViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `${SEEN_PREFIX}${slug}`;

    try {
      if (window.sessionStorage.getItem(key) === "1") return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage can be blocked outright (strict privacy modes); the read still counts.
    }

    void fetch("/api/goruntuleme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      cache: "no-store",
      keepalive: true,
    }).catch(() => {
      // The counter is a secondary signal; it must never surface to the reader.
    });
  }, [slug]);

  return null;
}
