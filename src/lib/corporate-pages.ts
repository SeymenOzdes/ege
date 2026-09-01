/**
 * Kurumsal sayfaların tek listesi.
 *
 * Üç yer aynı listeye ihtiyaç duyuyor: belgelerin altındaki kardeş bağlantılar,
 * `sitemap.ts` ve doğrulama sırasında "yedi bağlantının hepsi açılıyor mu"
 * kontrolü. Sayfa eklendiğinde burası güncellenmezse sitemap'te de görünmez —
 * bu yüzden liste kodun içinde, yorumda değil.
 *
 * `title` sayfanın kendi `<h1>`'i ile aynı; `label` kardeş bağlantı rozetinde
 * yer alan kısa hâli.
 */
export type CorporatePage = {
  path: string;
  title: string;
  label: string;
};

export const CORPORATE_PAGES: readonly CorporatePage[] = [
  { path: "/kunye", title: "Künye", label: "Künye" },
  { path: "/yayin-ilkeleri", title: "Yayın İlkeleri", label: "Yayın ilkeleri" },
  { path: "/duzeltmeler", title: "Düzeltmeler", label: "Düzeltmeler" },
  { path: "/iletisim", title: "İletişim", label: "İletişim" },
  { path: "/gizlilik", title: "Gizlilik Politikası", label: "Gizlilik" },
  { path: "/cerezler", title: "Çerez Politikası", label: "Çerezler" },
  { path: "/kullanim-kosullari", title: "Kullanım Koşulları", label: "Kullanım koşulları" },
] as const;
