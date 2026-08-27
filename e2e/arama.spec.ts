import { expect, test } from "@playwright/test";

test("searches from the header and highlights the match", async ({ page }, testInfo) => {
  if (testInfo.project.name === "chromium") {
    await page.goto("/");
    await page.getByRole("button", { name: "Haber ara" }).click();
    await page.getByRole("searchbox", { name: "Haberlerde ara" }).fill("zeytin");
    await page.getByRole("button", { name: "Ara", exact: true }).click();
  } else {
    // The header search trigger collapses into the mobile menu on small viewports.
    await page.goto("/arama?q=zeytin");
  }

  await expect(page).toHaveURL(/\/arama\?q=zeytin$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("zeytin");
  await expect(
    page.getByRole("heading", { level: 3, name: /Zeytinin yeni hasat hikâyesi/ }),
  ).toBeVisible();
  // The excerpt marks the match, and it arrives as text rather than HTML.
  await expect(page.locator("mark").first()).toHaveText("zeytin");
});

test("matches Turkish text regardless of dotted and dotless casing", async ({ page }) => {
  for (const query of ["IZMIR", "İzmir", "izmir"]) {
    await page.goto(`/arama?q=${encodeURIComponent(query)}`);
    await expect(page.getByRole("status").filter({ hasText: "haber bulundu" })).toContainText(
      "2 haber bulundu.",
    );
  }
});

test("narrows results with the topic filter and clears it again", async ({ page }) => {
  await page.goto("/arama?q=yeni");
  await expect(page.getByRole("status").filter({ hasText: "haber bulundu" })).toContainText(
    "8 haber bulundu.",
  );

  await page.getByLabel("Konuya göre süz").selectOption("yasam");
  await page.getByRole("button", { name: "Ara", exact: true }).click();

  await expect(page).toHaveURL(/konu=yasam/);
  await expect(page.getByRole("status").filter({ hasText: "haber bulundu" })).toContainText(
    "2 haber bulundu.",
  );

  await page.getByRole("link", { name: "Filtreleri temizle" }).click();
  await expect(page).toHaveURL("/arama?q=yeni");
});

test("keeps the query when paging through results", async ({ page }) => {
  await page.goto("/arama?q=yeni");
  await page
    .getByRole("navigation", { name: "Sayfalama" })
    .getByRole("link", { name: "Sonraki sayfa" })
    .click();

  await expect(page).toHaveURL(/\/arama\?q=yeni&sayfa=2$/);
  await expect(page.getByRole("status").filter({ hasText: "haber bulundu" })).toContainText(
    "8 haber bulundu.",
  );
});

test("explains empty, too-short and no-result searches", async ({ page }) => {
  await page.goto("/arama");
  await expect(page.getByRole("status")).toContainText("Türkçe arama yapabilirsiniz");

  await page.goto("/arama?q=a");
  await expect(page.getByRole("status")).toContainText("En az 2 karakter girin.");

  await page.goto("/arama?q=antarktikafiloksera");
  await expect(page.getByRole("status")).toContainText("Sonuç bulunamadı.");
  await expect(page.getByRole("link", { name: "zeytin" })).toBeVisible();
});

test("never renders a search query as markup", async ({ page }) => {
  await page.goto(`/arama?q=${encodeURIComponent("<img src=x onerror=alert(1)>")}`);

  await expect(page.locator("h1 img")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "<img src=x onerror=alert(1)>",
  );
});

test("rejects out-of-range result pages with the permanent not-found state", async ({ page }) => {
  const response = await page.goto("/arama?q=yeni&sayfa=9");

  // Development streams the boundary with a 200; production returns a real 404.
  expect([200, 404]).toContain(response?.status());
  await expect(
    page.getByRole("heading", { name: "Aradığınız hikâye burada değil." }),
  ).toBeVisible();
});
