"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";

type SearchFilterRailProps = {
  className?: string;
  children: ReactNode;
};

/**
 * The /arama filter column. On small screens it is one sideways-scrolling line,
 * where an active filter near the end (Muğla, say) would load out of sight; this
 * centres the first one before paint. The links are plain `<a>`s, so without JS
 * the rail still works and only this nudge is lost.
 *
 * It runs on mount only: a filter picked from the rail was already on screen, and
 * re-centring on every navigation would yank the line away from the reader's
 * thumb when they pick a city while a topic is set.
 */
export function SearchFilterRail({ className, children }: SearchFilterRailProps) {
  const railRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;

    const active = rail.querySelector<HTMLElement>("[data-active]");
    if (!active) return;

    const railBox = rail.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    rail.scrollLeft += activeBox.left - railBox.left - (railBox.width - activeBox.width) / 2;
  }, []);

  return (
    <aside ref={railRef} className={className} aria-label="Arama filtreleri">
      {children}
    </aside>
  );
}
