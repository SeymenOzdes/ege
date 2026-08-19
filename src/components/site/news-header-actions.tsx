"use client";

import { useState } from "react";
import Link from "next/link";
import { ListIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

const navigation = [
  ["Son Dakika", "#son-dakika"],
  ["İzmir", "#izmir"],
  ["Ege", "#ege"],
  ["Ekonomi", "#ekonomi"],
  ["Yaşam", "#yasam"],
] as const;

export function NewsHeaderActions() {
  const [panel, setPanel] = useState<"search" | "menu" | null>(null);

  return (
    <div className="header-controls">
      <button
        className="icon-button"
        type="button"
        aria-label="Haber ara"
        aria-expanded={panel === "search"}
        onClick={() => setPanel(panel === "search" ? null : "search")}
      >
        {panel === "search" ? <XIcon /> : <MagnifyingGlassIcon />}
      </button>
      <button
        className="icon-button"
        type="button"
        aria-label="Menüyü aç"
        aria-expanded={panel === "menu"}
        onClick={() => setPanel(panel === "menu" ? null : "menu")}
      >
        {panel === "menu" ? <XIcon /> : <ListIcon />}
      </button>

      {panel && (
        <div className={`header-panel header-panel-${panel}`}>
          {panel === "search" ? (
            <form className="search-form" action="#haberler">
              <MagnifyingGlassIcon aria-hidden="true" />
              <input autoFocus name="q" type="search" placeholder="Ege'de ne arıyorsunuz?" />
              <button type="submit">Ara</button>
            </form>
          ) : (
            <nav aria-label="Açılır menü">
              {navigation.map(([label, href]) => (
                <Link href={href} key={href} onClick={() => setPanel(null)}>
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
