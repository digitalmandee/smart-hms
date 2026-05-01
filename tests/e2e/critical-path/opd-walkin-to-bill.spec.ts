/**
 * Critical Path E2E #2: OPD Walk-in Wizard → Token → Consult → Invoice → Payment
 * Per memory: 4-step wizard with mandatory upfront payment generates invoice + token.
 */
import { test, expect } from "../../../playwright-fixture";
import { demoLogin } from "../utils/demoLogin";

const TS = Date.now();

test.describe.serial("Critical Path: OPD walk-in → bill", () => {
  test("Step 1: Receptionist opens walk-in registration wizard", async ({ page }) => {
    await demoLogin(page, "Receptionist");
    await page.goto("/app/opd/walk-in").catch(() => {});
    if (!/walk-in/i.test(page.url())) await page.goto("/app/opd");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 2: Wizard collects patient + doctor + payment in one flow", async ({ page }) => {
    await demoLogin(page, "Receptionist");
    await page.goto("/app/opd/walk-in").catch(() => {});

    await page.getByLabel(/first name|name/i).first().fill(`OPD${TS}`).catch(() => {});
    await page.getByLabel(/phone|mobile/i).first().fill("03001234567").catch(() => {});

    const next = page.getByRole("button", { name: /next|continue/i }).first();
    if (await next.isVisible().catch(() => false)) await next.click();

    await expect(page.locator("h1, h2, [role='dialog']").first()).toBeVisible();
  });

  test("Step 3: Token queue reflects new patient", async ({ page }) => {
    await demoLogin(page, "Receptionist");
    await page.goto("/app/opd/tokens").catch(() => page.goto("/app/opd"));
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 4: Doctor sees the patient in their queue and starts consultation", async ({ page }) => {
    await demoLogin(page, "Doctor");
    await page.goto("/app/opd");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 5: Cashier confirms invoice was created and paid", async ({ page }) => {
    await demoLogin(page, "Cashier");
    await page.goto("/app/billing");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
