import { createLovableConfig } from "lovable-agent-playwright-config/config";

export default createLovableConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:8080",
  },
  webServer: {
    command: "npm run dev",
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
});

