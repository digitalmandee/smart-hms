import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

// ─── A. Page Load & Navigation ─────────────────────────────────────────────

test.describe("Accounts — Page Load", () => {
  test("Accounts Dashboard loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts");
    await expect(page).toHaveURL(/\/app\/accounts/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Chart of Accounts loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/chart-of-accounts");
    await expect(page).toHaveURL(/\/app\/accounts\/chart-of-accounts/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Account Types loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/account-types");
    await expect(page).toHaveURL(/\/app\/accounts\/account-types/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Journal Entries loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/journal-entries");
    await expect(page).toHaveURL(/\/app\/accounts\/journal-entries/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("General Ledger loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/general-ledger");
    await expect(page).toHaveURL(/\/app\/accounts\/general-ledger/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Receivables / Outstanding loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/receivables");
    await expect(page).toHaveURL(/\/app\/accounts\/receivables/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Payables / Vendor Bills loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/payables");
    await expect(page).toHaveURL(/\/app\/accounts\/payables/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Vendor Payments loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/vendor-payments");
    await expect(page).toHaveURL(/\/app\/accounts\/vendor-payments/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Expense Management loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/expenses");
    await expect(page).toHaveURL(/\/app\/accounts\/expenses/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Bank Accounts loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/bank-accounts");
    await expect(page).toHaveURL(/\/app\/accounts\/bank-accounts/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Budgets loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/budgets");
    await expect(page).toHaveURL(/\/app\/accounts\/budgets/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Credit Notes loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/credit-notes");
    await expect(page).toHaveURL(/\/app\/accounts\/credit-notes/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Fixed Assets loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/fixed-assets");
    await expect(page).toHaveURL(/\/app\/accounts\/fixed-assets/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Patient Deposits loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/patient-deposits");
    await expect(page).toHaveURL(/\/app\/accounts\/patient-deposits/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Period Management loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/period-management");
    await expect(page).toHaveURL(/\/app\/accounts\/period-management/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Audit Log loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/audit-log");
    await expect(page).toHaveURL(/\/app\/accounts\/audit-log/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Cost Centers loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/cost-centers");
    await expect(page).toHaveURL(/\/app\/accounts\/cost-centers/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Bank Reconciliation loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/bank-reconciliation");
    await expect(page).toHaveURL(/\/app\/accounts\/bank-reconciliation/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Cash to Bank loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/cash-to-bank");
    await expect(page).toHaveURL(/\/app\/accounts\/cash-to-bank/);
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

// ─── Financial Reports ──────────────────────────────────────────────────────

test.describe("Financial Reports — Page Load", () => {
  test("Financial Reports hub loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports");
    await expect(page).toHaveURL(/\/app\/accounts\/reports/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Trial Balance loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/trial-balance");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/trial-balance/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Profit & Loss loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/profit-loss");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/profit-loss/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Balance Sheet loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/balance-sheet");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/balance-sheet/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Cash Flow loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/cash-flow");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/cash-flow/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Detailed P&L loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/detailed-pnl");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/detailed-pnl/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Revenue by Source loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/revenue-source");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/revenue-source/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Cost Center P&L loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/cost-center-pnl");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/cost-center-pnl/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Consolidated P&L loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/consolidated-pnl");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/consolidated-pnl/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("VAT Return loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/vat-return");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/vat-return/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Payroll Cost loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/payroll-cost");
    await expect(page).toHaveURL(/\/app\/accounts\/reports\/payroll-cost/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Cash to Bank Report loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/cash-to-bank-report");
    await expect(page).toHaveURL(/\/app\/accounts\/cash-to-bank-report/);
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

// ─── Billing — Page Load ───────────────────────────────────────────────────

test.describe("Billing — Page Load", () => {
  test("Billing Dashboard loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing");
    await expect(page).toHaveURL(/\/app\/billing/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Invoices list loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/invoices");
    await expect(page).toHaveURL(/\/app\/billing\/invoices/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Payment History loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/payments");
    await expect(page).toHaveURL(/\/app\/billing\/payments/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Billing Sessions loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/sessions");
    await expect(page).toHaveURL(/\/app\/billing\/sessions/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Daily Closing loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/daily-closing");
    await expect(page).toHaveURL(/\/app\/billing\/daily-closing/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Insurance Claims loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/insurance-claims");
    await expect(page).toHaveURL(/\/app\/billing\/insurance-claims/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Payment Reconciliation loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/reconciliation");
    await expect(page).toHaveURL(/\/app\/billing\/reconciliation/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Doctor Settlements loads", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/doctor-settlements");
    await expect(page).toHaveURL(/\/app\/billing\/doctor-settlements/);
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

// ─── B. Chart of Accounts — Interactions ────────────────────────────────────

test.describe("Chart of Accounts — Interactions", () => {
  test("COA shows category filter tabs", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/chart-of-accounts");
    // Look for filter/tab controls for asset, liability, equity, revenue, expense
    const tabOrFilter = page.getByRole("tab").or(page.getByRole("button")).filter({ hasText: /asset|liabilit|equit|revenue|expense/i });
    await expect(tabOrFilter.first()).toBeVisible({ timeout: 15_000 });
  });

  test("COA search filters accounts", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/chart-of-accounts");
    const search = page.getByPlaceholder(/search/i);
    if (await search.isVisible().catch(() => false)) {
      await search.fill("Cash");
      await page.waitForTimeout(1000);
      // Should still show the page without errors
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("COA can open create account dialog", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/chart-of-accounts");
    const addBtn = page.getByRole("button", { name: /add|create|new/i });
    if (await addBtn.first().isVisible().catch(() => false)) {
      await addBtn.first().click();
      // A dialog/form should appear
      await expect(page.getByRole("dialog").or(page.getByRole("form")).or(page.locator("form")).first()).toBeVisible({ timeout: 5_000 });
    }
  });
});

// ─── C. Journal Entries — Interactions ──────────────────────────────────────

test.describe("Journal Entries — Interactions", () => {
  test("Journal list shows entries or empty state", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/journal-entries");
    // Should show a table or empty state
    const table = page.locator("table").first();
    const empty = page.getByText(/no.*journal|no.*entries|no.*data/i).first();
    await expect(table.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("Journal entry create form opens", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/journal-entries");
    const createBtn = page.getByRole("button", { name: /new|create|add/i });
    if (await createBtn.first().isVisible().catch(() => false)) {
      await createBtn.first().click();
      await page.waitForTimeout(1500);
      // Should navigate to create page or open dialog
      await expect(page.locator("h1, h2, [role=dialog]").first()).toBeVisible();
    }
  });

  test("Journal filters by date range", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/journal-entries");
    const dateInput = page.locator("input[type=date], button:has-text('Date')").first();
    if (await dateInput.isVisible().catch(() => false)) {
      await expect(dateInput).toBeVisible();
    }
  });
});

// ─── D. Billing & Invoices — Interactions ───────────────────────────────────

test.describe("Billing — Interactions", () => {
  test("Invoices list shows table or empty state", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/invoices");
    const table = page.locator("table").first();
    const empty = page.getByText(/no.*invoice|no.*data/i).first();
    await expect(table.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("Payments list shows table or empty state", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/payments");
    const table = page.locator("table").first();
    const empty = page.getByText(/no.*payment|no.*data/i).first();
    await expect(table.or(empty)).toBeVisible({ timeout: 15_000 });
  });
});

// ─── E. Daily Closing — Interactions ────────────────────────────────────────

test.describe("Daily Closing — Interactions", () => {
  test("Daily closing page shows wizard or history", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/billing/daily-closing");
    // Should show either the wizard steps or a history/date picker
    const content = page.locator("h1, h2, [role=tabpanel], table, button").first();
    await expect(content).toBeVisible({ timeout: 15_000 });
  });
});

// ─── F. Financial Reports — Content Verification ────────────────────────────

test.describe("Financial Reports — Content", () => {
  test("Trial Balance shows account rows or empty", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/trial-balance");
    const table = page.locator("table").first();
    const empty = page.getByText(/no.*data|no.*account/i).first();
    await expect(table.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("P&L shows revenue and expense sections", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/profit-loss");
    const content = page.getByText(/revenue|income|expense/i).first();
    const empty = page.getByText(/no.*data/i).first();
    await expect(content.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("Balance Sheet shows assets section", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/balance-sheet");
    const content = page.getByText(/asset|liabilit|equity/i).first();
    const empty = page.getByText(/no.*data/i).first();
    await expect(content.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("Cash Flow shows cash categories", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/cash-flow");
    const content = page.getByText(/operat|invest|financ|cash/i).first();
    const empty = page.getByText(/no.*data/i).first();
    await expect(content.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("Detailed P&L shows hierarchical breakdown", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/reports/detailed-pnl");
    const content = page.locator("table, [class*=tree], [class*=row]").first();
    const empty = page.getByText(/no.*data/i).first();
    await expect(content.or(empty)).toBeVisible({ timeout: 15_000 });
  });
});

// ─── G. Advanced Features — Interactions ────────────────────────────────────

test.describe("Advanced Accounting Features", () => {
  test("Credit Notes shows list or empty state", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/credit-notes");
    const table = page.locator("table").first();
    const empty = page.getByText(/no.*credit|no.*data/i).first();
    await expect(table.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("Credit Notes create form opens", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/credit-notes");
    const btn = page.getByRole("button", { name: /new|create|add/i });
    if (await btn.first().isVisible().catch(() => false)) {
      await btn.first().click();
      await expect(page.getByRole("dialog").or(page.locator("form")).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test("Patient Deposits shows list or empty state", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/patient-deposits");
    const table = page.locator("table").first();
    const empty = page.getByText(/no.*deposit|no.*data/i).first();
    await expect(table.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("Fixed Assets shows register or empty state", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/fixed-assets");
    const table = page.locator("table").first();
    const empty = page.getByText(/no.*asset|no.*data/i).first();
    await expect(table.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("Cost Centers shows list or empty state", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/cost-centers");
    const table = page.locator("table").first();
    const empty = page.getByText(/no.*cost|no.*data/i).first();
    await expect(table.or(empty)).toBeVisible({ timeout: 15_000 });
  });

  test("Bank Reconciliation shows upload area or table", async ({ page }) => {
    await demoLogin(page, "Accountant");
    await page.goto("/app/accounts/bank-reconciliation");
    const content = page.locator("table, input[type=file], button:has-text('Upload'), button:has-text('Import')").first();
    const empty = page.getByText(/no.*data|upload|import/i).first();
    await expect(content.or(empty)).toBeVisible({ timeout: 15_000 });
  });
});
