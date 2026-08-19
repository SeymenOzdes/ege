import Link from "next/link";
import { PulseIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/lib/site";

type BrandProps = {
  className?: string;
};

export function Brand({ className }: BrandProps) {
  return (
    <Link className={`brand-mark ${className ?? ""}`} href="/" aria-label={siteConfig.name}>
      <span className="brand-icon" aria-hidden="true">
        <PulseIcon weight="bold" />
      </span>
      <span className="brand-type">
        <strong>EGE&apos;NİN</strong>
        <span>NABZI</span>
      </span>
    </Link>
  );
}
