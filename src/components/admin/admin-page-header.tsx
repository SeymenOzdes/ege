import Link from "next/link";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  eyebrow = "Yönetim",
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <nav aria-label="Sayfa yolu" className="text-sm text-[var(--color-ink-muted)]">
          <Link className="hover:text-[var(--color-teal)]" href="/yonetim">
            Yönetim
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{eyebrow}</span>
        </nav>
        <h1 className="font-editorial mt-3 text-4xl sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl leading-7 text-[var(--color-ink-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
