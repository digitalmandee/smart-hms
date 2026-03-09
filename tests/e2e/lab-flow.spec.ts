import { test, expect } from "../../playwright-fixture";
import { demoLogin } from "./utils/demoLogin";

test("Lab Tech can open Lab Queue", async ({ page }) => {
  await demoLogin(page, "Lab Tech");

  await page.goto("/app/lab/queue");
  await expect(page).toHaveURL(/\/app\/lab\/queue/);
  await expect(page.getByRole("heading", { level: 1, name: "Lab Orders Queue" })).toBeVisible();

  // Basic UI elements (stable English strings in this page)
  await expect(page.getByPlaceholder("Search by patient, order number...")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Ordered" })).toBeVisible();
});
