import type { ReactNode } from "react";
import { JsonLd } from "@/components/site/json-ld";
import { PublicShell } from "@/components/site/public-shell";
import { siteJsonLd } from "@/lib/json-ld";

/**
 * No route-segment override here on purpose.
 *
 * The shell used to force `dynamic = "force-dynamic"` because it rendered the reader's
 * account state, which closed the CDN cache on every public page. That state now
 * resolves in the browser, so each page underneath decides its own caching.
 */
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <PublicShell>
      {/*
       * `WebSite` + `NewsMediaOrganization`, kök düzende değil burada: kök düzen
       * yönetim panelini de sarıyor ve yayının kimlik bilgisini `noindex` bir
       * panelde tekrarlamanın anlamı yok. Sabit veriden üretiliyor, sayfanın
       * statik kalmasını engellemiyor.
       */}
      <JsonLd data={siteJsonLd()} />
      {children}
    </PublicShell>
  );
}
