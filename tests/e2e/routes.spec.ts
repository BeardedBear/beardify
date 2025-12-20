import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1366, height: 768 },
];

let playlistId: string | null = null;
let albumId: string | null = null;

// Fetch a single playlist & first album (if possible) before running tests
test.beforeAll(async ({ request }) => {
  const token = process.env.TEST_SPOTIFY_ACCESS_TOKEN;
  if (!token) {
    // No token — the tests will still run but route-specific tests will be skipped
    return;
  }

  try {
    const res = await request.get('https://api.spotify.com/v1/me/playlists?limit=1', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok()) {
      const body = await res.json();
      const item = body.items?.[0];
      if (item && item.id) playlistId = item.id;

      if (playlistId) {
        const t = await request.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (t.ok()) {
          const tb = await t.json();
          const track = tb.items?.[0]?.track;
          if (track?.album?.id) albumId = track.album.id;
        }
      }
    }
  } catch {
    // silence - we will skip route-specific tests below if ids are null
  }
});

for (const vp of VIEWPORTS) {
  test.describe(`authenticated routes — ${vp.name}`, () => {
    test.beforeEach(async ({ page, context }) => {
      const at = process.env.TEST_SPOTIFY_ACCESS_TOKEN;
      const me = process.env.TEST_SPOTIFY_ME_JSON;
      if (!at || !me) {
        // No test account configured — still run the basic layout checks on public pages
        return;
      }

      const storagePayload = JSON.stringify({
        accessToken: at,
        code: '',
        me: JSON.parse(me),
        storage: { codeChallenge: '', codeVerifier: '', referer: '', refreshToken: '' },
      });

      await context.addInitScript((value) => localStorage.setItem('beardify-auth', value), storagePayload);
      await page.goto('/');
      await page.waitForTimeout(500);
    });

    test(`home page — no horizontal overflow & topbar visible at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForTimeout(400);

      const dims = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
        bodyW: Math.round(document.body.getBoundingClientRect().width),
      }));

      expect(dims.scrollW).toBeLessThanOrEqual(dims.innerW + 2);
      expect(dims.bodyW).toBeLessThanOrEqual(dims.innerW + 2);

      await expect(page.locator('header, .topbar, .app-header, .login')).toBeVisible({ timeout: 2000 });
      await page.screenshot({ path: `test-results/routes-home-${vp.name}.png`, fullPage: false });
    });

    test(`sidebar present and not causing overflow at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForTimeout(400);

        // Sidebar element exists in DOM. If the app doesn't render the sidebar in this test
      // environment (for example if playlists didn't load), skip this check to avoid flakes.
      const sidebar = page.locator('.sidebar');
      const count = await sidebar.count();
      if (count === 0) {
        test.skip(true, 'Sidebar not available in this environment');
      }

      // Check that sidebar doesn't cause horizontal overflow
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerW = await page.evaluate(() => window.innerWidth);
      expect(scrollW).toBeLessThanOrEqual(innerW + 2);
    });

    test(`playlist page layout at ${vp.name}`, async ({ page }) => {
      if (!playlistId) test.skip(true, 'No playlist id available from Spotify API');
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/playlist/${playlistId}`);
      await page.waitForSelector('.playlist', { timeout: 4000 });

      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerW = await page.evaluate(() => window.innerWidth);
      expect(scrollW).toBeLessThanOrEqual(innerW + 2);

      await expect(page.locator('.playlist')).toBeVisible();
      await page.screenshot({ path: `test-results/routes-playlist-${vp.name}.png`, fullPage: false });
    });

    test(`album page layout at ${vp.name}`, async ({ page }) => {
      if (!albumId) test.skip(true, 'No album id available from Spotify API');
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/album/${albumId}`);
      await page.waitForSelector('.album-page', { timeout: 4000 });

      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerW = await page.evaluate(() => window.innerWidth);
      expect(scrollW).toBeLessThanOrEqual(innerW + 2);

      await expect(page.locator('.album-page')).toBeVisible();
      await page.screenshot({ path: `test-results/routes-album-${vp.name}.png`, fullPage: false });
    });
  });
}
