import { defineConfig } from "@playwright/test";

const channel = process.env.PLAYWRIGHT_CHANNEL ?? "chrome";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: ".artifacts/playwright",
  use: {
    baseURL: "http://127.0.0.1:5173",
    channel: channel === "chromium" ? undefined : channel,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npm run dev:backend",
      url: "http://127.0.0.1:8080/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev:frontend -- --host 127.0.0.1 --strictPort",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
