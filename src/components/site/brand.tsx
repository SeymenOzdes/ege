"use client";

import Link from "next/link";
import { PulseIcon } from "@phosphor-icons/react/dist/ssr/Pulse";
import { siteConfig } from "@/lib/site";

type BrandProps = {
  className?: string;
  /** `wordmark` is the serif masthead logotype; `icon` is the pulse badge + stacked name. */
  variant?: "icon" | "wordmark";
};

export function Brand({ className, variant = "icon" }: BrandProps) {
  return (
    <Link
      className={`brand-mark ${className ?? ""}`}
      href="/"
      aria-label={siteConfig.name}
      onClick={(event) => {
        event.preventDefault();
        window.location.href = "/";
      }}
    >
      {variant === "wordmark" ? (
        <span className="brand-wordmark" aria-hidden="true">
          Ege&apos;nin Nabzı
        </span>
      ) : (
        <>
          <span className="brand-icon" aria-hidden="true">
            <PulseIcon weight="bold" />
          </span>
          <span className="brand-type">
            <strong>EGE&apos;NİN</strong>
            <span>NABZI</span>
          </span>
        </>
      )}
    </Link>
  );
}
