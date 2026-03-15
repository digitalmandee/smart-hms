import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Pharmacist can open Pharmacy Dashboard", async ({ page }) => {
  await demoLogin(page, "Pharmacist");

  await page.goto("/app/pharmacy");
  await expect(page).toHaveURL(/\/app\/pharmacy/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Pharmacist can open Prescription Queue", async ({ page }) => {
  await demoLogin(page, "Pharmacist");

  await page.goto("/app/pharmacy/queue");
  await expect(page).toHaveURL(/\/app\/pharmacy\/queue/);
  await expect(page.locator("table").first()).toBeVisible();
});

test("Pharmacist can search Prescription Queue", async ({ page }) => {
  await demoLogin(page, "Pharmacist");

  await page.goto("/app/pharmacy/queue");
  const searchInput = page.locator("input[placeholder]").first();
  await expect(searchInput).toBeVisible();
  await searchInput.fill("test");
  await expect(searchInput).toHaveValue("test");
});

test("Pharmacist can open Inventory page", async ({ page }) => {
  await demoLogin(page, "Pharmacist");

  await page.goto("/app/pharmacy/inventory");
  await expect(page).toHaveURL(/\/app\/pharmacy\/inventory/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Pharmacist can open POS terminal", async ({ page }) => {
  await demoLogin(page, "Pharmacist");

  await page.goto("/app/pharmacy/pos");
  await expect(page).toHaveURL(/\/app\/pharmacy\/pos/);
  await expect(page.locator("h1").first()).toBeVisible();
});
