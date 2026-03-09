import type { Page } from "@playwright/test";

const UNLOCK_PASSWORD = "1212";

/**
 * Logs into the demo environment via the UI.
 *
 * roleLabel must match the button label shown on the Login page (e.g. "Lab Tech", "Pharmacist", "Doctor").
 */
export async function demoLogin(page: Page, roleLabel: string) {
  await page.goto("/auth/login");

  // Handle demo lock screen (may already be unlocked in some environments)
  const unlockButton = page.getByRole("button", { name: /unlock/i });
  if (await unlockButton.isVisible().catch(() => false)) {
    await page.getByPlaceholder(/enter password/i).fill(UNLOCK_PASSWORD);
    await unlockButton.click();
  }

  // Click the role quick-login button
  await page.getByRole("button", { name: roleLabel, exact: true }).click();

  // The app should navigate into /app after login
  await page.waitForURL(/\/app\//, { timeout: 30_000 });
}
