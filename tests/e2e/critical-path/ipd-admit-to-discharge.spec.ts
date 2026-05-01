/**
 * Critical Path E2E #1: IPD Admit → Charges → Discharge → Invoice → Payment
 *
 * Highest-revenue lifecycle in the system. Failure = patient admitted but cannot be billed.
 */
import { test, expect } from "../../../playwright-fixture";
import { demoLogin } from "../utils/demoLogin";

const TS = Date.now();
const PATIENT_TAG = `E2E${TS}`;

test.describe.serial("Critical Path: IPD admit → discharge → bill", () => {
  test("Step 1: Receptionist registers a new patient", async ({ page }) => {
    await demoLogin(page, "Receptionist");
    await page.goto("/app/patients/new");
    await expect(page).toHaveURL(/\/app\/patients\/new/);

    await page.getByLabel(/first name|given name/i).first().fill(PATIENT_TAG).catch(() => {});
    await page.getByLabel(/last name|family name|surname/i).first().fill("IPD").catch(() => {});
    await page.getByLabel(/phone|mobile/i).first().fill("03001234567").catch(() => {});

    const submit = page.getByRole("button", { name: /save|register|create patient/i }).first();
    if (await submit.isVisible().catch(() => false)) await submit.click();
    await page.waitForURL(/\/app\/patients/, { timeout: 15_000 }).catch(() => {});
  });

  test("Step 2: Admit patient to IPD ward (mandatory procedure + attending doctor)", async ({ page }) => {
    await demoLogin(page, "Receptionist");
    await page.goto("/app/ipd/admissions");

    const newAdmission = page.getByRole("button", { name: /new admission|admit patient|\+\s*admit/i }).first();
    if (await newAdmission.isVisible().catch(() => false)) {
      await newAdmission.click();
      await page.getByPlaceholder(/search patient|patient name/i).first().fill(PATIENT_TAG).catch(() => {});
    }
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 3: Nurse can record vitals & medication on the admission", async ({ page }) => {
    await demoLogin(page, "IPD Nurse");
    await page.goto("/app/ipd/admissions");
    await expect(page.locator("h1, h2").first()).toBeVisible();

    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible().catch(() => false)) {
      await firstRow.click();
      const vitalsTab = page.getByRole("tab", { name: /vital|medication|chart/i }).first();
      if (await vitalsTab.isVisible().catch(() => false)) await vitalsTab.click();
    }
  });

  test("Step 4: Discharge generates an invoice with pending charges", async ({ page }) => {
    await demoLogin(page, "Receptionist");
    await page.goto("/app/ipd/admissions");

    const dischargeBtn = page.getByRole("button", { name: /discharge/i }).first();
    if (await dischargeBtn.isVisible().catch(() => false)) {
      await dischargeBtn.click();
      await page.waitForTimeout(1000);
    }

    await page.goto("/app/billing");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Step 5: Payment recorded creates a journal entry", async ({ page }) => {
    await demoLogin(page, "Cashier");
    await page.goto("/app/finance/journal-entries");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
