import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("IPD Nurse can open Admissions list", async ({ page }) => {
  await demoLogin(page, "IPD Nurse");

  await page.goto("/app/ipd/admissions");
  await expect(page).toHaveURL(/\/app\/ipd\/admissions/);
  await expect(page.locator("h1").first()).toBeVisible();
});
