import type { UserRole } from "@/lib/auth/roles";

export type AdminNavigationItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const navigationItems: AdminNavigationItem[] = [
  { href: "/yonetim", label: "Genel bakış" },
  { href: "/yonetim/haberler", label: "Haberler" },
  { href: "/yonetim/haberler/yeni", label: "Yeni haber" },
  { href: "/yonetim/medya", label: "Medya" },
  { href: "/yonetim/anasayfa", label: "Yayın ayarları", adminOnly: true },
];

export function getAdminNavigation(role: UserRole): AdminNavigationItem[] {
  return navigationItems.filter((item) => !item.adminOnly || role === "ADMIN");
}

export function getAdminPageTitle(pathname: string) {
  const matchedItem = [...navigationItems]
    .sort((first, second) => second.href.length - first.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return matchedItem?.label ?? "Yönetim";
}
