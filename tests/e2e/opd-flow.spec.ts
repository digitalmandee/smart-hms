import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Doctor can open OPD dashboard", async ({ page }) => {
  await demoLogin(page, "Doctor");

  await page.goto("/app/opd");
  await expect(page).toHaveURL(/\/app\/opd/);
  await expect(page.locator("h1").first()).toBeVisible();
});
