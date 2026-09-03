import { defineConfig, devices } from "@playwright/test";

/** Yönetim akışları bu dosyada; kamusal projeler onu çalıştırmıyor. */
const ADMIN_SPEC = /yonetim\.spec\.ts/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    // `next dev` normalizes every `request.url`-derived redirect to its canonical
    // "localhost" origin regardless of the Host header a client actually sent
    // (verified: a request with `Host: 127.0.0.1:3000` still gets back
    // `Location: http://localhost:3000/...`). Auth cookies are scoped to whatever
    // origin the browser really connected through, so navigating via 127.0.0.1 makes
    // every redirect-based auth flow (dev-login, OAuth callback) hop to a different
    // origin and drop the session cookie. Matching baseURL to that canonical origin
    // avoids the mismatch.
    baseURL: "http://localhost:3000",
    channel: "chromium",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", testIgnore: ADMIN_SPEC, use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", testIgnore: ADMIN_SPEC, use: { ...devices["Pixel 7"] } },
    { name: "admin", testMatch: ADMIN_SPEC, use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // `"route"`, `/auth/dev-login` rotasını elle çağrılabilir bırakır ama
    // otomatik yönlendirmeyi kapalı tutar: `auth.spec.ts` oturumsuz ziyaretçinin
    // gerçekten giriş sayfasına düştüğünü doğrulamayı sürdürüyor, `yonetim.spec.ts`
    // ise oturumu o rotadan açıyor. Next 16 aynı dizinde ikinci bir dev sunucusuna
    // izin vermediği için iki proje tek sunucuyu paylaşmak zorunda.
    env: { ...process.env, DEV_ADMIN_AUTO_LOGIN: "route" },
  },
});
