import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Radiologist can open Reporting worklist", async ({ page }) => {
  await demoLogin(page, "Radiologist");

  await page.goto("/app/radiology/reporting");
  await expect(page).toHaveURL(/\/app\/radiology\/reporting/);
  await expect(page.locator("h1").first()).toBeVisible();
});
