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
  { href: "/yonetim/aboneler", label: "Aboneler", adminOnly: true },
  { href: "/yonetim/anasayfa", label: "Yayın ayarları", adminOnly: true },
];

export function getAdminNavigation(role: UserRole): AdminNavigationItem[] {
  return navigationItems.filter((item) => !item.adminOnly || role === "ADMIN");
}

/** En özelden en genele: iç içe rotalar tek bir bölüme çözümlensin diye. */
const itemsBySpecificity = [...navigationItems].sort(
  (first, second) => second.href.length - first.href.length,
);

function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Bir rotanın ait olduğu **tek** menü girdisi.
 *
 * Önek eşleşmesi tek başına yeterli değildir: `/yonetim/haberler/yeni` hem
 * "Yeni haber"e tam, hem "Haberler"e önek olarak uyar ve ikisi birden etkin
 * görünürdü. En uzun eşleşme kazandığı için yalnızca en özel girdi kalır.
 *
 * `/yonetim` yalnızca tam eşleşir; aksi hâlde her yönetim sayfasında "Genel
 * bakış" da yanardı.
 */
export function getActiveAdminHref(pathname: string): string | undefined {
  return itemsBySpecificity.find((item) =>
    item.href === "/yonetim" ? pathname === item.href : matchesRoute(pathname, item.href),
  )?.href;
}

export function getAdminPageTitle(pathname: string) {
  return itemsBySpecificity.find((item) => matchesRoute(pathname, item.href))?.label ?? "Yönetim";
}
