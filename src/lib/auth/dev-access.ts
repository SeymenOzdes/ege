import "server-only";

const devAdminEmail = "dev-admin@ege.local";
const devAdminPassword = "dev-admin-password";

/**
 * `/yonetim`'e oturumsuz girildiğinde otomatik yönlendirme yapılsın mı?
 *
 * Yalnızca geliştirme derlemesinde ve `DEV_ADMIN_AUTO_LOGIN=true` ile açıkça
 * açıldığında aktiftir; `next start` üretim derlemesinde her koşulda kapalıdır.
 * E2E çalıştırmalarında kapalı kalır: `auth.spec.ts` oturumsuz bir ziyaretçinin
 * gerçekten giriş sayfasına düştüğünü doğruluyor.
 */
export function isDevAdminAutoLoginEnabled() {
  return process.env.NODE_ENV === "development" && process.env.DEV_ADMIN_AUTO_LOGIN === "true";
}

/**
 * `/auth/dev-login` rotasının kendisi çalışsın mı?
 *
 * `"route"` değeri otomatik yönlendirmeyi kapalı tutar ama rotayı elle
 * çağrılabilir bırakır. Yönetim e2e testleri bunu kullanıyor: Next 16 aynı
 * dizinde ikinci bir dev sunucusuna izin vermiyor, dolayısıyla koruma testiyle
 * yönetim testi tek sunucuyu ve tek bayrağı paylaşmak zorunda.
 *
 * İki kapı da `NODE_ENV === "development"` şartına bağlı; üretimde ikisi de
 * kapalıdır.
 */
export function isDevAdminLoginRouteEnabled() {
  const flag = process.env.DEV_ADMIN_AUTO_LOGIN;
  return process.env.NODE_ENV === "development" && (flag === "true" || flag === "route");
}

/**
 * supabase/seed.sql içindeki yerel admin hesabıyla birebir eşleşir.
 * Varsayılanları değiştirirsen seed bloğunu da güncelle.
 */
export function devAdminCredentials() {
  return {
    email: process.env.DEV_ADMIN_EMAIL ?? devAdminEmail,
    password: process.env.DEV_ADMIN_PASSWORD ?? devAdminPassword,
  };
}
