import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:8080",
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npm run dev",
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
