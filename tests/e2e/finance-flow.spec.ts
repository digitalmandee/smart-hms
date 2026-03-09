import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Accountant can open Accounts dashboard", async ({ page }) => {
  await demoLogin(page, "Accountant");

  await page.goto("/app/accounts");
  await expect(page).toHaveURL(/\/app\/accounts/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Accountant can open Billing invoices list", async ({ page }) => {
  await demoLogin(page, "Accountant");

  await page.goto("/app/billing/invoices");
  await expect(page).toHaveURL(/\/app\/billing\/invoices/);
  await expect(page.locator("h1").first()).toBeVisible();
});
