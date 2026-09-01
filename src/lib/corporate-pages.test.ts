import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CORPORATE_PAGES } from "@/lib/corporate-pages";

// jsdom ortamında `import.meta.url` bir `file:` adresi olmuyor, bu yüzden yol
// depo kökünden kuruluyor — vitest süreci daima kökten çalışıyor.
const KURUMSAL_DIR = join(process.cwd(), "src", "app", "(site)", "(kurumsal)");

describe("CORPORATE_PAGES", () => {
  it("altbilgideki yedi bağlantının tamamını kapsar", () => {
    // `public-shell.tsx` ve `newsletter-form.tsx` bu yollara bağlanıyor.
    expect(CORPORATE_PAGES.map((page) => page.path)).toEqual([
      "/kunye",
      "/yayin-ilkeleri",
      "/duzeltmeler",
      "/iletisim",
      "/gizlilik",
      "/cerezler",
      "/kullanim-kosullari",
    ]);
  });

  it("listedeki her yol için gerçekten bir rota var", () => {
    // Listeye bir yol eklenip sayfası yazılmazsa sitemap 404 bildirir; bu test
    // o sessiz hatayı yakalar.
    const routes = readdirSync(KURUMSAL_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `/${entry.name}`)
      .sort();

    expect([...CORPORATE_PAGES.map((page) => page.path)].sort()).toEqual(routes);
  });
});
