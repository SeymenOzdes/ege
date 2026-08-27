import { expect, test } from "@playwright/test";

test("renders the complete editorial homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Ege'nin Nabzı");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Körfezin iki yakasında sabah: İzmir'in yeni kıyı rotaları",
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("link", {
        name: "Mahalle pazarlarında yerel ürün için yeni dayanışma ağı",
        exact: true,
      })
      .first(),
  ).toHaveAttribute("href", "/haber/mahalle-pazarlarinda-yerel-urun");
});
