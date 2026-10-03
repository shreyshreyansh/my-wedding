// Still frames of every section and RSVP state at four screen sizes, compared with tests/__golden__.
// After an intended change: npx playwright test visual --update-snapshots, then look at the new images before committing.
import { expect, test, type Page } from '@playwright/test';
import { LATE, TODAY, openCover } from './helpers';

const SIZES: Record<string, [number, number][]> = { phone: [[390, 844], [375, 667], [360, 800]], desktop: [[1440, 900]] };
/* tests/e2e/visual.css hides the music bell and the paintings (see there) */
const shot = { animations: 'disabled' as const, stylePath: 'tests/e2e/visual.css' };

test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(TODAY); });

async function ready(page: Page, url: string) {
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
}

test('cover and whole page, for everyone and for a Hindi family', async ({ page }, info) => {
  for (const [w, h] of SIZES[info.project.name]) {
    await page.setViewportSize({ width: w, height: h });
    for (const [name, url] of [['generic', '/'], ['hindi', '/?g=abc234']]) {
      await ready(page, url);
      await expect(page).toHaveScreenshot(`${w}x${h}-${name}-cover.png`, shot);
      await openCover(page);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${w}x${h}-${name}-page.png`, { ...shot, fullPage: true });
    }
  }
});

test('the invitation card in each language', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone');
  await ready(page, '/');
  await openCover(page);
  for (const l of ['en', 'mr', 'hi']) {
    await page.locator(`label[for="inv-${l}"]`).click();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#invite')).toHaveScreenshot(`invite-${l}.png`, shot);
  }
});

test('every RSVP state', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'phone');
  const rsvp = page.locator('#rsvp');
  await ready(page, '/?g=vsf234');
  await openCover(page);
  await expect(rsvp).toHaveScreenshot('rsvp-form.png', shot);
  await request.post('/api/rsvp', { data: { g: 'vis234', t: 1, rid: 'visual', name: 'Anil', n: { haldi: 2, sangeet: 0, shaadi: 2 } } });
  await ready(page, '/?g=vis234');
  await openCover(page);
  await expect(rsvp).toHaveScreenshot('rsvp-replied.png', shot);
  await ready(page, LATE + '/?g=abc234');
  await openCover(page);
  await expect(rsvp).toHaveScreenshot('rsvp-closed.png', shot);
  await ready(page, '/');
  await openCover(page);
  await expect(rsvp).toHaveScreenshot('rsvp-nocode.png', shot);
  await page.route('**/api/rsvp', (r) => r.abort());
  await ready(page, '/?g=vsf234');
  await openCover(page);
  await page.locator('.r-send').click();
  await expect(page.locator('.r-failed')).toBeVisible({ timeout: 20_000 });
  await expect(rsvp).toHaveScreenshot('rsvp-failed.png', shot);
});
