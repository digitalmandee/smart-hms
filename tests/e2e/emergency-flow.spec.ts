import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Doctor can open ER Dashboard", async ({ page }) => {
  await demoLogin(page, "Doctor");

  await page.goto("/app/emergency");
  await expect(page).toHaveURL(/\/app\/emergency/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Doctor can open ER Registration form", async ({ page }) => {
  await demoLogin(page, "Doctor");

  await page.goto("/app/emergency/register");
  await expect(page).toHaveURL(/\/app\/emergency\/register/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Doctor can open ER Triage page", async ({ page }) => {
  await demoLogin(page, "Doctor");

  await page.goto("/app/emergency/triage");
  await expect(page).toHaveURL(/\/app\/emergency\/triage/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Doctor can open ER Queue", async ({ page }) => {
  await demoLogin(page, "Doctor");

  await page.goto("/app/emergency/queue");
  await expect(page).toHaveURL(/\/app\/emergency\/queue/);
  await expect(page.locator("h1").first()).toBeVisible();
});
