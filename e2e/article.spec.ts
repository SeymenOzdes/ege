import { expect, test } from "@playwright/test";

const articleTitle = "Mahalle pazarlarında yerel ürün için yeni dayanışma ağı";

test("opens the sample article from the homepage card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: articleTitle, exact: true }).first().click();

  await expect(page).toHaveURL(/\/haber\/mahalle-pazarlarinda-yerel-urun$/);
  await expect(page.getByRole("heading", { name: articleTitle, level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ece Aksoy" })).toBeVisible();
  // No hero figure yet: `hero_media_id` is null on every seeded article, so the
  // figure is omitted rather than rendering a broken image.
  await expect(page.locator("figure img")).toHaveCount(0);
  // Headings come from the stored `body` jsonb, not from a hardcoded fixture.
  await expect(page.getByRole("heading", { name: "Dört ilçede ortak rota" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "İlgili hikâyeler" })).toBeVisible();
  await expect(page.getByText("ARTICLE_MID")).toBeVisible();
  await expect(page.getByText("ARTICLE_END")).toBeVisible();
});

test("anonim okuru kaydetmeden önce girişe yönlendirir", async ({ page }) => {
  await page.goto("/haber/mahalle-pazarlarinda-yerel-urun");

  await expect(page.getByRole("button", { name: "Haberi paylaş" })).toBeVisible();

  // Oturum açmamış ziyaretçi için kaydetme, iyimser bir açma/kapama değil giriş
  // akışının başlangıcıdır: hedef haber çerezde taşınır.
  await page.getByRole("button", { name: "Haberi kaydetmek için giriş yap" }).click();

  await expect(page).toHaveURL(/\/giris\?next=%2Fhaber%2Fmahalle-pazarlarinda-yerel-urun/);
});

test("returns a permanent not-found state for unknown article slugs", async ({ page }) => {
  const response = await page.goto("/haber/bilinmeyen-haber");

  // The development server can stream the custom not-found boundary with a 200 status.
  // Production status is covered by the production smoke check.
  expect([200, 404]).toContain(response?.status());
  await expect(
    page.getByRole("heading", { name: "Aradığınız hikâye burada değil." }),
  ).toBeVisible();
});

test("keeps the article inside the mobile viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chrome", "Mobile-only assertion");
  await page.goto("/haber/mahalle-pazarlarinda-yerel-urun");

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
