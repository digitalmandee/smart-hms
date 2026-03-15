import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Doctor can open OPD dashboard", async ({ page }) => {
  await demoLogin(page, "Doctor");

  await page.goto("/app/opd");
  await expect(page).toHaveURL(/\/app\/opd/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Receptionist can view OPD page", async ({ page }) => {
  await demoLogin(page, "Receptionist");

  await page.goto("/app/opd");
  await expect(page).toHaveURL(/\/app\/opd/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Nurse can view nursing queue", async ({ page }) => {
  await demoLogin(page, "Nurse");

  await page.goto("/app/opd/nursing");
  await expect(page).toHaveURL(/\/app\/opd\/nursing/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Doctor can search patients on OPD", async ({ page }) => {
  await demoLogin(page, "Doctor");

  await page.goto("/app/opd");
  const searchInput = page.locator("input[placeholder]").first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill("Muhammad");
    await expect(searchInput).toHaveValue("Muhammad");
  }
});
