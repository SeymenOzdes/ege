"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon } from "@phosphor-icons/react/dist/ssr/Bell";
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { HouseIcon } from "@phosphor-icons/react/dist/ssr/House";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { NewspaperIcon } from "@phosphor-icons/react/dist/ssr/Newspaper";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { Brand } from "@/components/site/brand";
import { signOut } from "@/lib/auth/actions";
import type { UserRole } from "@/lib/auth/roles";
import { getAdminNavigation } from "@/lib/admin/navigation";

type AdminShellProps = { children: ReactNode; role: UserRole };

const navigationIcons = {
  "/yonetim": HouseIcon,
  "/yonetim/haberler": NewspaperIcon,
  "/yonetim/haberler/yeni": PlusIcon,
  "/yonetim/medya": ImageIcon,
  "/yonetim/anasayfa": GearSixIcon,
};

function isActivePath(pathname: string, href: string) {
  return href === "/yonetim"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLinks({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Yönetim menüsü" className="grid gap-1">
      {getAdminNavigation(role).map((item) => {
        const Icon = navigationIcons[item.href as keyof typeof navigationIcons];
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm font-semibold transition ${
              active
                ? "bg-[var(--color-ink)] text-white"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
            }`}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            <Icon aria-hidden="true" size={19} weight={active ? "fill" : "bold"} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="grid size-10 place-items-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition hover:border-[var(--color-teal)]"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <BellIcon aria-hidden="true" size={19} weight="bold" />
        <span className="sr-only">Bildirimleri göster</span>
      </button>
      {isOpen ? (
        <section
          aria-label="Bildirimler"
          className="absolute top-12 right-0 z-20 w-72 rounded-[18px] border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-soft)]"
          role="dialog"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">Bildirimler</p>
            <button
              className="text-[var(--color-ink-muted)]"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <XIcon aria-hidden="true" size={18} />
              <span className="sr-only">Bildirimleri kapat</span>
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--color-ink-muted)]">
            Yeni editoryal bildirim yok. Yayın ve inceleme değişiklikleri burada görünecek.
          </p>
        </section>
      ) : null}
    </div>
  );
}

function SignOutControl() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-teal)]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Çıkış yap
      </button>
      {isOpen ? (
        <div
          aria-labelledby="sign-out-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[rgb(13_27_42_/_42%)] p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[var(--shadow-soft)]">
            <p className="eyebrow text-[var(--color-teal)]">Oturum</p>
            <h2 className="font-editorial mt-2 text-3xl" id="sign-out-title">
              Çıkış yapılsın mı?
            </h2>
            <p className="mt-3 leading-6 text-[var(--color-ink-muted)]">
              Bu cihazdaki editoryal oturumunuz sonlandırılacak.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-ink-muted)]"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Vazgeç
              </button>
              <form action={signOut}>
                <button
                  className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white"
                  type="submit"
                >
                  Çıkış yap
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AdminShell({ children, role }: AdminShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-[var(--color-line)] bg-white p-5 lg:sticky lg:top-0 lg:block lg:h-screen">
        <div className="flex h-full flex-col">
          <Brand />
          <p className="eyebrow mt-10 text-[var(--color-teal)]">Editoryal yönetim</p>
          <div className="mt-3">
            <NavigationLinks role={role} />
          </div>
          <div className="mt-auto rounded-[18px] bg-[var(--color-paper)] p-4 text-sm text-[var(--color-ink-muted)]">
            <p className="font-semibold text-[var(--color-ink)]">
              {role === "ADMIN" ? "Yönetici" : "Editör"}
            </p>
            <p className="mt-1 leading-5">Rolünüze uygun yayın araçları açık.</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[rgb(246_241_232_/_94%)] px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                aria-expanded={mobileNavigationOpen}
                className="grid size-10 place-items-center rounded-full border border-[var(--color-line)] bg-white"
                onClick={() => setMobileNavigationOpen((open) => !open)}
                type="button"
              >
                <ListIcon aria-hidden="true" size={21} weight="bold" />
                <span className="sr-only">Yönetim menüsünü aç</span>
              </button>
              <Brand />
            </div>
            <p className="hidden text-sm font-semibold text-[var(--color-ink-muted)] lg:block">
              Yönetim paneli
            </p>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <SignOutControl />
            </div>
          </div>
          {mobileNavigationOpen ? (
            <div className="mx-auto mt-3 max-w-7xl rounded-[20px] border border-[var(--color-line)] bg-white p-3 shadow-[var(--shadow-soft)] lg:hidden">
              <NavigationLinks onNavigate={() => setMobileNavigationOpen(false)} role={role} />
            </div>
          ) : null}
        </header>
        {children}
      </div>
    </div>
  );
}
