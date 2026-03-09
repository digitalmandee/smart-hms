import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Store Manager can open Inventory dashboard", async ({ page }) => {
  await demoLogin(page, "Store Manager");

  await page.goto("/app/inventory");
  await expect(page).toHaveURL(/\/app\/inventory/);
  await expect(page.locator("h1").first()).toBeVisible();
});
