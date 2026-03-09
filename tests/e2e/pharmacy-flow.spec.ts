import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Pharmacist can open Prescription Queue", async ({ page }) => {
  await demoLogin(page, "Pharmacist");

  await page.goto("/app/pharmacy/queue");
  await expect(page).toHaveURL(/\/app\/pharmacy\/queue/);

  // DataTable uses a real <table>
  await expect(page.locator("table").first()).toBeVisible();
});
