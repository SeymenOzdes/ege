import { expect, test } from "@playwright/test";

test("lists the latest news timeline with a pager", async ({ page }) => {
  await page.goto("/son-dakika");

  await expect(page).toHaveTitle("Son Dakika | Ege'nin Nabzı");
  await expect(page.getByRole("heading", { level: 1, name: "Son dakika" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: /Körfezin iki yakasında sabah/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Sayfalama" }).getByRole("link", { name: "Sonraki sayfa" }),
  ).toBeVisible();
});

test("walks to page two of the timeline and back", async ({ page }) => {
  await page.goto("/son-dakika");
  await page.getByRole("link", { name: "Sonraki sayfa" }).click();

  await expect(page).toHaveURL(/\/son-dakika\?sayfa=2$/);
  await expect(
    page.getByRole("heading", { level: 3, name: /Mahalle pazarlarında yerel ürün/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Sayfalama" }).getByRole("link", { name: "Önceki sayfa" }),
  ).toBeVisible();
});

test("rejects out-of-range pages with the permanent not-found state", async ({ page }) => {
  const response = await page.goto("/son-dakika?sayfa=99");

  // Development streams the boundary with a 200; production returns a real 404.
  expect([200, 404]).toContain(response?.status());
  await expect(
    page.getByRole("heading", { name: "Aradığınız hikâye burada değil." }),
  ).toBeVisible();
});

test("serves topic, city and author archives from existing links", async ({ page }, testInfo) => {
  await page.goto("/kategori/ekonomi");
  await expect(page.getByRole("heading", { level: 1, name: "Ekonomi" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: /Zeytinin yeni hasat hikâyesi/ }),
  ).toBeVisible();

  if (testInfo.project.name === "chromium") {
    // The city strip is hidden behind the mobile menu on small viewports.
    await page.goto("/");
    await page.getByRole("link", { name: "İzmir", exact: true }).first().click();
    await expect(page).toHaveURL(/\/kategori\/izmir$/);
  } else {
    await page.goto("/kategori/izmir");
  }
  await expect(page.getByRole("heading", { level: 1, name: "İzmir" })).toBeVisible();

  await page.goto("/yazar/ece-aksoy");
  await expect(page).toHaveTitle("Ece Aksoy | Ege'nin Nabzı");
  await expect(page.getByText("Yerel yaşam muhabiri").first()).toBeVisible();
});

test("marks sponsored sample content on the article page", async ({ page }) => {
  await page.goto("/haber/mahalle-pazarlarinda-yerel-urun");

  await expect(page.getByText("Sponsorlu içerik")).toBeVisible();
});
