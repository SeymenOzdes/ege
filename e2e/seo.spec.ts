import { expect, test } from "@playwright/test";

/**
 * Sitemap, robots ve besleme üç ayrı rota olarak üretiliyor; hiçbirinin
 * ekranda karşılığı olmadığı için sessizce bozulabilirler. Bu dosya üçünü de
 * ham yanıt olarak okuyor.
 */

test("robots.txt yönetim ve ince içerik yollarını kapatıyor", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain("Disallow: /yonetim/");
  expect(body).toContain("Disallow: /auth/");
  expect(body).toContain("Disallow: /arama");
  expect(body).toContain("Disallow: /stil-rehberi");
  expect(body).toContain("Sitemap: http://127.0.0.1:3000/sitemap.xml");
});

test("sitemap ana sayfayı, haberleri ve kurumsal sayfaları listeliyor", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain("<loc>http://127.0.0.1:3000/</loc>");
  expect(body).toContain("<loc>http://127.0.0.1:3000/son-dakika</loc>");
  expect(body).toContain("/haber/izmirin-kiyi-rotalari");
  expect(body).toContain("/kategori/gundem");
  expect(body).toContain("/kunye");
  expect(body).toContain("/gizlilik");
  // Kapatılmış yollar sitemap'e girmemeli; robots.txt ile çelişirdi.
  expect(body).not.toContain("/yonetim");
  expect(body).not.toContain("/stil-rehberi");
});

test("besleme geçerli RSS olarak dönüyor", async ({ request }) => {
  const response = await request.get("/feed.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");

  const body = await response.text();
  expect(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  expect(body).toContain('<atom:link href="http://127.0.0.1:3000/feed.xml" rel="self"');
  expect(body).toContain("<item>");
  expect(body).toContain("/haber/izmirin-kiyi-rotalari");
});

test("ana sayfa beslemeyi ve site düzeyi yapısal veriyi bildiriyor", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
    "href",
    /\/feed\.xml$/,
  );

  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  const graph = JSON.parse(jsonLd ?? "{}")["@graph"] as { "@type": string }[];
  expect(graph.map((node) => node["@type"])).toEqual(["WebSite", "NewsMediaOrganization"]);
});

test("stil rehberi dizine girmemeyi bildiriyor", async ({ page }) => {
  await page.goto("/stil-rehberi");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("kategori arşivi kırıntı yolu yayımlıyor", async ({ page }) => {
  await page.goto("/kategori/gundem");

  const nodes = await page.locator('script[type="application/ld+json"]').allTextContents();
  const breadcrumb = nodes
    .map((node) => JSON.parse(node))
    .find((node) => node["@type"] === "BreadcrumbList");

  expect(breadcrumb).toBeDefined();
  expect(breadcrumb.itemListElement).toHaveLength(2);
  expect(breadcrumb.itemListElement[1].name).toBe("Gündem");
});
