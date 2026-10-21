import { defineConfig, devices } from '@playwright/test';

// Browser regression tests (#128). `npm run e2e` builds, copies e2e/fixtures/ to site/e2e/ and serves site/ like
// GitHub Pages. WebKit is Playwright's WebKit build, not Safari on a real device.
const port = 4329;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${port}/kern/e2e/`,
    locale: 'de-CH',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `node scripts/e2e-fixtures.mjs && node scripts/serve-docs.mjs ${port}`,
    url: `http://localhost:${port}/kern/e2e/form.html`,
    reuseExistingServer: false,
  },
});
