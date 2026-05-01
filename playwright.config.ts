import { defineConfig } from "@playwright/test";

// In the Lovable sandbox the bundled Chromium is missing system libs, so
// we point Playwright at a Nix-provided binary. In CI (GitHub Actions) we
// let Playwright use its own bundled browser via `playwright install`.
const isCI = !!process.env.CI;
const NIX_CHROMIUM =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  "/nix/store/wzfqrpwxk230xqjl1z27h7lis19gjs4f-playwright-browsers/chromium-1194/chrome-linux/chrome";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: 1,
  reporter: isCI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:8080",
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: isCI ? "retain-on-failure" : "off",
    launchOptions: isCI
      ? { args: ["--no-sandbox", "--disable-dev-shm-usage"] }
      : {
          executablePath: NIX_CHROMIUM,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        },
  },
  webServer: {
    command: isCI ? "npm run preview -- --port 8080" : "npm run dev",
    port: 8080,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
