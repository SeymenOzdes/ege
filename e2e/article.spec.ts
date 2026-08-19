import { expect, test } from "@playwright/test";

const articleTitle = "Mahalle pazarlarında yerel ürün için yeni dayanışma ağı";

test("opens the sample article from the homepage card", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: articleTitle, exact: true }).first().click();

  await expect(page).toHaveURL(/\/haber\/mahalle-pazarlarinda-yerel-urun$/);
  await expect(page.getByRole("heading", { name: articleTitle, level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ece Aksoy" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Manisa'daki bir mahalle pazarında üretici/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dört ilçede ortak rota" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "İlgili hikâyeler" })).toBeVisible();
  await expect(page.getByText("ARTICLE_MID")).toBeVisible();
  await expect(page.getByText("ARTICLE_END")).toBeVisible();
});

test("exposes functional, accessible article actions", async ({ page }) => {
  await page.goto("/haber/mahalle-pazarlarinda-yerel-urun");

  const saveButton = page.getByRole("button", { name: "Haberi kaydet" });
  await expect(saveButton).toHaveAttribute("aria-pressed", "false");
  await saveButton.click();
  await expect(page.getByRole("button", { name: "Haberi kaydedilenlerden çıkar" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Haberi paylaş" })).toBeVisible();
});

test("returns a permanent not-found state for unknown article slugs", async ({ page }) => {
  const response = await page.goto("/haber/bilinmeyen-haber");

  expect(response?.status()).toBe(404);
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
