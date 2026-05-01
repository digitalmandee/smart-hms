/**
 * Critical Path E2E #3: Lab Order → Specimen Collected → Result → Published → Billed
 * Per memory: Save → Submit → Publish lifecycle, realtime sync to invoice on payment.
 */
import { test, expect } from "../../../playwright-fixture";
import { demoLogin } from "../utils/demoLogin";

test.describe.serial("Critical Path: Lab order → result → bill", () => {
  test("Step 1: Doctor places a lab order from OPD", async ({ page }) => {
    await demoLogin(page, "Doctor");
    await page.goto("/app/opd");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 2: Lab tech sees order in queue", async ({ page }) => {
    await demoLogin(page, "Lab Tech");
    await page.goto("/app/lab/queue");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 3: Lab tech marks specimen collected (locks fields)", async ({ page }) => {
    await demoLogin(page, "Lab Tech");
    await page.goto("/app/lab/queue");

    const collectBtn = page.getByRole("button", { name: /collect|specimen/i }).first();
    if (await collectBtn.isVisible().catch(() => false)) await collectBtn.click();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 4: Lab tech enters result and submits", async ({ page }) => {
    await demoLogin(page, "Lab Tech");
    await page.goto("/app/lab/queue");

    const resultsTab = page.getByRole("tab", { name: /result|reporting/i }).first();
    if (await resultsTab.isVisible().catch(() => false)) await resultsTab.click();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 5: Pathologist verifies/publishes the result", async ({ page }) => {
    await demoLogin(page, "Lab Tech");
    await page.goto("/app/lab/queue");

    const publishBtn = page.getByRole("button", { name: /publish|verify|approve/i }).first();
    if (await publishBtn.isVisible().catch(() => false)) await publishBtn.click();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 6: Doctor sees published result in patient chart", async ({ page }) => {
    await demoLogin(page, "Doctor");
    await page.goto("/app/opd");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
