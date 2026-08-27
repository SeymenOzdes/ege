"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ComponentType, Ref } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

type PanelId = "search" | "menu";

const quickNavigation = [
  ["Son Dakika", "#son-dakika"],
  ["İzmir", "#izmir"],
  ["Ege", "#ege"],
  ["Ekonomi", "#ekonomi"],
  ["Yaşam", "#yasam"],
] as const;

const panelActions: Readonly<
  Record<PanelId, { label: string; closedIcon: ComponentType; openIcon: ComponentType }>
> = {
  search: {
    label: "Haber ara",
    closedIcon: MagnifyingGlassIcon,
    openIcon: XIcon,
  },
  menu: {
    label: "Menüyü aç",
    closedIcon: ListIcon,
    openIcon: XIcon,
  },
};

const panelIds = Object.keys(panelActions) as PanelId[];

const emptySubscribe = () => () => {};

// Hydration-safe "rendered on the client" flag without setState in an effect.
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

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

function MenuPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav aria-label="Hızlı erişim">
      {quickNavigation.map(([label, href]) => (
        <Link href={href} key={href} onClick={onNavigate}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function NewsHeaderActions() {
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null);
  // Panels live outside this component (see the portal below), so only look
  // up their host element after hydration.
  const isClient = useIsClient();
  const rootRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<PanelId, HTMLButtonElement | null>>({
    search: null,
    menu: null,
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
      const target = event.target as Node;
      const insideHeaderControls = rootRef.current?.contains(target);
      const insideDrawer = drawerRef.current?.contains(target);
      if (!insideHeaderControls && !insideDrawer) setOpenPanel(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpenPanel(null);
      triggerRefs.current[activePanel]?.focus();
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openPanel]);

  // Move focus into the search field once the panel starts opening,
  // after the browser has laid out the freshly visible panel.
  useEffect(() => {
    if (openPanel !== "search") return;
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [openPanel]);

  const headerElement = isClient ? document.getElementById("site-header") : null;

  // Rendered into the site header so the panel can drop from the header's
  // bottom edge, full-width and centered above the page content.
  const panels = (
    <div className="header-drawer" ref={drawerRef}>
      <div
        id="header-panel-search"
        className="header-panel-slot"
        data-open={openPanel === "search" ? "true" : "false"}
        inert={openPanel !== "search"}
      >
        <div className="header-panel header-panel-search">
          <SearchPanel inputRef={searchInputRef} />
        </div>
      </div>

      <div
        id="header-panel-menu"
        className="header-panel-slot"
        data-open={openPanel === "menu" ? "true" : "false"}
        inert={openPanel !== "menu"}
      >
        <div className="header-panel header-panel-menu">
          <MenuPanel onNavigate={() => setOpenPanel(null)} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="header-controls" ref={rootRef}>
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

      {headerElement ? createPortal(panels, headerElement) : null}
    </>
  );
}
