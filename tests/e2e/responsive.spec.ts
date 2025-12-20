import { test, expect } from '@playwright/test';

// This test uses a real Spotify account supplied via environment variables:
// - TEST_SPOTIFY_ACCESS_TOKEN: Spotify access token (string)
// - TEST_SPOTIFY_ME_JSON: JSON string of the Spotify user object (stringified JSON)

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1366, height: 768 },
];

function makeAuthPayload(accessToken: string, meJson: string) {
  // Matches the Pinia persist key used by AuthStore (key: 'beardify-auth')
  const storage = {
    codeChallenge: '',
    codeVerifier: '',
    referer: '',
    refreshToken: '',
  };

  const obj = {
    accessToken: accessToken,
    code: '',
    me: JSON.parse(meJson),
    storage,
  };

  return JSON.stringify(obj);
}

for (const vp of VIEWPORTS) {
  test.describe(`responsive — ${vp.name}`, () => {
    test.beforeEach(async ({ page, context }, testInfo) => {
      const at = process.env.TEST_SPOTIFY_ACCESS_TOKEN;
      const me = process.env.TEST_SPOTIFY_ME_JSON;

      if (!at || !me) {
        test.skip(true, 'Set TEST_SPOTIFY_ACCESS_TOKEN and TEST_SPOTIFY_ME_JSON env variables to run these tests');
      }

      // Inject auth BEFORE the app initializes
      const authString = makeAuthPayload(at, me!);
      await context.addInitScript(
        (value) => {
          localStorage.setItem('beardify-auth', value);
        },
        authString,
      );

      // visit root
      await page.goto('/');
      // wait for some app rendering time
      await page.waitForTimeout(500);
    });

    test(`no horizontal overflow at ${vp.width} (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(400);

      // Check body/document widths
      const dims = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
        bodyW: document.body.getBoundingClientRect().width,
      }));

      // Allow a 2px tolerance (subpixel / rounding)
      expect(dims.scrollW).toBeLessThanOrEqual(dims.innerW + 2);
      expect(Math.round(dims.bodyW)).toBeLessThanOrEqual(dims.innerW + 2);

      // Save a screenshot for visual review
      await page.screenshot({ path: `test-results/responsive-${vp.name}.png`, fullPage: false });

      // Visual snapshot for regression tests (Playwright will create baseline on first run)
      expect(await page.screenshot({ fullPage: false })).toMatchSnapshot(`topbar-${vp.name}.png`);
    });

    test(`top header should be visible and not clipped at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(400);

      // Example selector that should be present on most pages
      await expect(page.locator('header, .app-header, .topbar, .login')).toBeVisible({ timeout: 2000 });
    });
  });
}
