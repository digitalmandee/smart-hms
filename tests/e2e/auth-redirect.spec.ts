import { test, expect } from "../../playwright-fixture";

test("unauthenticated user is redirected to /auth/login", async ({ page }) => {
  await page.goto("/app/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);
});
