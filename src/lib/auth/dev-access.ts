import "server-only";

const devAdminEmail = "dev-admin@ege.local";
const devAdminPassword = "dev-admin-password";

/**
 * Yerel geliştirme hızlı girişi. Yalnızca geliştirme derlemesinde ve
 * `DEV_ADMIN_AUTO_LOGIN=true` ile açıkça açıldığında aktiftir; `next start`
 * üretim derlemesinde her koşulda kapalıdır. E2E çalıştırmalarında bayrak
 * playwright.config.ts içinde `false`'a sabitlenir.
 */
export function isDevAdminAutoLoginEnabled() {
  return process.env.NODE_ENV === "development" && process.env.DEV_ADMIN_AUTO_LOGIN === "true";
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
