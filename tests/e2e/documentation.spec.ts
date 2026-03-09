import { test, expect } from "../../playwright-fixture";

test("Documentation Hub loads", async ({ page }) => {
  await page.goto("/documentation");
  await expect(page.getByRole("heading", { level: 1, name: /documentation/i })).toBeVisible();
  await expect(page.getByPlaceholder("Search modules...")).toBeVisible();
});

test("OPD documentation page loads", async ({ page }) => {
  await page.goto("/opd-documentation");
  await expect(page.locator("h1").first()).toBeVisible();
});
