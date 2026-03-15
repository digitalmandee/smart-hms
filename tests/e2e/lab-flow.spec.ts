import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Lab Tech can open Lab Dashboard", async ({ page }) => {
  await demoLogin(page, "Lab Tech");

  await page.goto("/app/lab");
  await expect(page).toHaveURL(/\/app\/lab/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("Lab Tech can open Lab Queue", async ({ page }) => {
  await demoLogin(page, "Lab Tech");

  await page.goto("/app/lab/queue");
  await expect(page).toHaveURL(/\/app\/lab\/queue/);
  await expect(page.getByRole("heading", { level: 1, name: "Lab Orders Queue" })).toBeVisible();
  await expect(page.getByPlaceholder("Search by patient, order number...")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Ordered" })).toBeVisible();
});

test("Lab Tech can see all queue tabs", async ({ page }) => {
  await demoLogin(page, "Lab Tech");

  await page.goto("/app/lab/queue");
  await expect(page.getByRole("tab", { name: "Ordered" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Collected" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Completed" })).toBeVisible();
});

test("Lab Tech can search lab orders", async ({ page }) => {
  await demoLogin(page, "Lab Tech");

  await page.goto("/app/lab/queue");
  const searchInput = page.getByPlaceholder("Search by patient, order number...");
  await expect(searchInput).toBeVisible();
  await searchInput.fill("CBC");
  await expect(searchInput).toHaveValue("CBC");
});

test("Lab Tech can open Lab Templates", async ({ page }) => {
  await demoLogin(page, "Lab Tech");

  await page.goto("/app/lab/templates");
  await expect(page).toHaveURL(/\/app\/lab\/templates/);
  await expect(page.locator("h1").first()).toBeVisible();
});
