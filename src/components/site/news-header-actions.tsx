"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType, Ref } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

type PanelId = "search";

const panelActions: Readonly<
  Record<PanelId, { label: string; closedIcon: ComponentType; openIcon: ComponentType }>
> = {
  search: {
    label: "Haber ara",
    closedIcon: MagnifyingGlassIcon,
    openIcon: XIcon,
  },
};

const panelIds = Object.keys(panelActions) as PanelId[];

function SearchPanel({ inputRef }: { inputRef: Ref<HTMLInputElement> }) {
  return (
    <form className="search-form" action="/arama" method="get">
      <MagnifyingGlassIcon aria-hidden="true" />
      <input
        name="q"
        type="search"
        placeholder="Ege'de ne arıyorsunuz?"
        aria-label="Haberlerde ara"
        ref={inputRef}
      />
      <button type="submit">Ara</button>
    </form>
  );
}

export function NewsHeaderActions() {
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<PanelId, HTMLButtonElement | null>>({
    search: null,
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  function togglePanel(id: PanelId) {
    setOpenPanel((current) => (current === id ? null : id));
  }

  // Dismiss the panel on outside interaction or Escape.
  useEffect(() => {
    if (!openPanel) return;
    const activePanel = openPanel;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpenPanel(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpenPanel(null);
      triggerRefs.current[activePanel]?.focus({ preventScroll: true });
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openPanel]);

  // Move focus into the search field once the panel starts opening,
  // after the browser has laid out the freshly visible panel. The field is
  // always in view inside the sticky header, so never let focus scroll.
  useEffect(() => {
    if (openPanel !== "search") return;
    const frame = requestAnimationFrame(() =>
      searchInputRef.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [openPanel]);

  return (
    <div className="header-controls" ref={rootRef}>
      {/* The field slides out of the trigger's left edge, sitting right
          next to the button instead of dropping below the header. */}
      <div
        id="header-panel-search"
        className="header-search-slot"
        data-open={openPanel === "search" ? "true" : "false"}
        inert={openPanel !== "search"}
      >
        <SearchPanel inputRef={searchInputRef} />
      </div>

      {panelIds.map((id) => {
        const isOpen = openPanel === id;
        const Icon = isOpen ? panelActions[id].openIcon : panelActions[id].closedIcon;
        return (
          <button
            key={id}
            className="icon-button"
            type="button"
            aria-label={panelActions[id].label}
            aria-expanded={isOpen}
            aria-controls={`header-panel-${id}`}
            onClick={() => togglePanel(id)}
            ref={(node) => {
              triggerRefs.current[id] = node;
            }}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
