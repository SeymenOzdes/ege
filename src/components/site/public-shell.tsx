import type { ReactNode } from "react";
import Link from "next/link";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import { NewspaperClipping } from "@phosphor-icons/react/dist/ssr/NewspaperClipping";
import { UserCircle } from "@phosphor-icons/react/dist/ssr/UserCircle";
import { Brand } from "@/components/site/brand";
import { NewsHeaderActions } from "@/components/site/news-header-actions";

const navigation = [
  ["Gündem", "/kategori/gundem"],
  ["Ekonomi", "/kategori/ekonomi"],
  ["Kültür-Sanat", "/kategori/kultur-sanat"],
  ["Yaşam", "/kategori/yasam"],
] as const;

const cityNavigation = [
  ["İzmir", "izmir"],
  ["Aydın", "aydin"],
  ["Muğla", "mugla"],
  ["Manisa", "manisa"],
  ["Denizli", "denizli"],
  ["Balıkesir", "balikesir"],
] as const;

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-site">
      <header className="site-header" id="site-header">
        <div className="utility-bar">
          <div className="shell-container utility-bar-inner">
            <Link className="utility-breaking" href="/son-dakika">
              <NewspaperClipping aria-hidden="true" size={16} weight="fill" />
              Son Dakika
            </Link>
            <nav className="city-nav" aria-label="Şehirler">
              {cityNavigation.map(([city, slug]) => (
                <Link href={`/kategori/${slug}`} key={slug}>
                  {city}
                </Link>
              ))}
            </nav>
            <span className="region-label">
              <MapPin aria-hidden="true" size={15} weight="fill" /> Ege Bölgesi
            </span>
          </div>
        </div>

        <div className="shell-container main-header-row">
          <Brand className="header-brand" />
          <nav className="primary-nav" aria-label="Ana menü">
            {navigation.map(([label, href]) => (
              <Link className="nav-link" href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-tools">
            <NewsHeaderActions />
            <Link className="login-action" href="/giris">
              <UserCircle aria-hidden="true" size={21} weight="duotone" />
              <span>Giriş</span>
            </Link>
            <Link className="header-action" href="/bulten">
              Bültene katıl
            </Link>
          </div>
          <details className="mobile-nav">
            <summary aria-label="Menüyü aç">
              <List aria-hidden="true" size={22} weight="bold" />
            </summary>
            <nav aria-label="Mobil menü">
              <Link href="/son-dakika">Son Dakika</Link>
              {navigation.map(([label, href]) => (
                <Link href={href} key={href}>
                  {label}
                </Link>
              ))}
              <Link href="/arama">Arama</Link>
              <Link href="/giris">Giriş</Link>
              <Link href="/bulten">Bültene katıl</Link>
            </nav>
          </details>
        </div>
      </header>

      <main className="public-main">{children}</main>

      <footer className="site-footer">
        <div className="shell-container footer-grid">
          <div className="footer-intro">
            <Brand className="text-base" />
            <p>Ege&apos;nin şehirlerinden güvenilir, sakin ve seçilmiş haberler.</p>
          </div>
          <nav aria-label="Haberler">
            <strong>Haberler</strong>
            <Link href="/son-dakika">Son Dakika</Link>
            <Link href="/kategori/gundem">Gündem</Link>
            <Link href="/kategori/ekonomi">Ekonomi</Link>
            <Link href="/kategori/kultur-sanat">Kültür-Sanat</Link>
          </nav>
          <nav aria-label="Kurumsal">
            <strong>Kurumsal</strong>
            <Link href="/kunye">Künye</Link>
            <Link href="/yayin-ilkeleri">Yayın İlkeleri</Link>
            <Link href="/duzeltmeler">Düzeltmeler</Link>
            <Link href="/iletisim">İletişim</Link>
          </nav>
          <nav aria-label="Üyelik">
            <strong>Takipte kal</strong>
            <Link href="/bulten">Bülten</Link>
            <Link href="/giris">Okur girişi</Link>
            <Link href="/kaydedilenler">Kaydedilenler</Link>
            <Link href="/gizlilik">Gizlilik</Link>
          </nav>
        </div>
        <div className="shell-container footer-bottom">
          <p>© {new Date().getFullYear()} Ege&apos;nin Nabzı. Tüm hakları saklıdır.</p>
          <div>
            <Link href="/cerezler">Çerezler</Link>
            <Link href="/kullanim-kosullari">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
