import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Taranmasında yarar olmayan yollar.
 *
 * İki gerekçe var ve karışmamalı:
 *
 * - **Erişilemez alanlar** (`/yonetim`, `/auth`, `/api`, `/kaydedilenler`):
 *   robot zaten giriş ekranına ya da hataya çarpar. Kapatmak, tarama bütçesini
 *   ve sunucuyu boşuna meşgul etmemek için.
 * - **İnce içerik** (`/arama`, `/stil-rehberi`): erişilebilir ama dizine girmesi
 *   istenmiyor. Arama sonuçları her sorgu için ayrı bir adres üretir; stil
 *   rehberi ise iç tasarım belgesidir.
 *
 * İkinci gruptaki sayfalar ayrıca `robots: { index: false }` metadata'sı da
 * taşıyor. `robots.txt` ile engellenen bir sayfanın `noindex` etiketi
 * okunamayacağı için ikisi tam olarak aynı işi yapmıyor: burası taramayı,
 * metadata dizine girmeyi engelliyor. Adres başka yerden bağlanmışsa
 * `noindex` devreye girer.
 */
const DISALLOWED = ["/yonetim/", "/auth/", "/api/", "/kaydedilenler", "/arama", "/stil-rehberi"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED,
    },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host: new URL(siteConfig.url).host,
  };
}
