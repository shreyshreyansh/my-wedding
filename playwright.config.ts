import { defineConfig, devices } from '@playwright/test';

// `npm test` builds the site (with a test tone as the music), then runs everything against local Cloudflare
// Pages (wrangler) with a mock Google Sheet. Two edges: one today, one after replies have closed.
export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.002 } },
  fullyParallel: true,
  workers: 3,
  reporter: [['list']],
  snapshotPathTemplate: '{testDir}/__golden__/{testFilePath}/{arg}{ext}',
  use: { baseURL: 'http://127.0.0.1:8788', trace: 'retain-on-failure' },
  projects: [
    { name: 'unit', testMatch: /unit\/.*\.spec\.ts$/ },
    { name: 'phone', testMatch: /e2e\/(?!perf).*\.spec\.ts$/, use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, contextOptions: { reducedMotion: 'reduce' } } },
    { name: 'desktop', testMatch: /e2e\/(visual|motion|a11y|seo)\.spec\.ts$/, use: { viewport: { width: 1440, height: 900 }, contextOptions: { reducedMotion: 'reduce' } } },
    /* timing is measured alone, after everything else, so parallel tests can't slow the throttled CPU */
    { name: 'perf', testMatch: /e2e\/perf\.spec\.ts$/, dependencies: ['phone', 'desktop'], use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 } }
  ],
  webServer: process.env.UNIT ? [] : [
    { command: 'node tests/mock-sheet.mjs 8799', url: 'http://127.0.0.1:8799/log', reuseExistingServer: false },
    { command: 'bash tests/serve-edge.sh 8788', url: 'http://127.0.0.1:8788/', timeout: 120_000, reuseExistingServer: false },
    { command: 'bash tests/serve-edge.sh 8789 2026-12-01T12:00:00+05:30', url: 'http://127.0.0.1:8789/', timeout: 120_000, reuseExistingServer: false }
  ]
});
