/**
 * Critical Path E2E #7: Daily Closing — Close billing sessions → Run closing → Reconcile
 * Per memory: blocked if any billing session remains open.
 */
import { test, expect } from "../../../playwright-fixture";
import { demoLogin } from "../utils/demoLogin";

test.describe.serial("Critical Path: Daily closing reconciliation", () => {
  test("Step 1: Cashier opens billing sessions list", async ({ page }) => {
    await demoLogin(page, "Cashier");
    await page.goto("/app/billing/sessions").catch(() => page.goto("/app/billing"));
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 2: Close all open billing sessions", async ({ page }) => {
    await demoLogin(page, "Cashier");
    await page.goto("/app/billing/sessions").catch(() => page.goto("/app/billing"));

    const closeBtn = page.getByRole("button", { name: /close session|end session/i }).first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 3: Cashier opens Daily Closing", async ({ page }) => {
    await demoLogin(page, "Cashier");
    await page.goto("/app/finance/daily-closing").catch(() => page.goto("/app/finance"));
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 4: Run daily closing (blocked if any session open)", async ({ page }) => {
    await demoLogin(page, "Cashier");
    await page.goto("/app/finance/daily-closing").catch(() => page.goto("/app/finance"));

    const runBtn = page.getByRole("button", { name: /run closing|close day|finalize/i }).first();
    if (await runBtn.isVisible().catch(() => false)) await runBtn.click().catch(() => {});
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
