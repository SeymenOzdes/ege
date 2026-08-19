import { expect, test } from "@playwright/test";

test("renders the publication shell", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Ege'nin Nabzı");
  await expect(page.getByRole("heading", { name: /Ege'nin gündemine/i })).toBeVisible();
});
