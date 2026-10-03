// Without JavaScript: no cover, everything readable, the form posts and comes back replied, the language switch works.
import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('the page reads top to bottom without the cover', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#cover')).toBeHidden();
  await expect(page.locator('#heroTitle')).toBeVisible();
  await expect(page.locator('.chapter')).toHaveCount(3);
  await expect(page.locator('.chapter .plate-art img').first()).toBeVisible(); /* the paintings need no script */
  await expect(page.locator('#through .th-art img')).toBeVisible();
  await expect(page.locator('.rite[data-rite="knot"]').first()).toHaveAttribute('href', /calendar\.google\.com\/calendar\/render\?action=TEMPLATE/);
  await expect(page.locator('.rite[data-rite="way"]').first()).toHaveAttribute('href', /google\.com\/maps/);
});

test('the language switch needs no script', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.inv-card.c-en')).toBeVisible();
  await page.locator('label[for="inv-mr"]').click();
  await expect(page.locator('.inv-card.c-mr')).toBeVisible();
  await expect(page.locator('.inv-card.c-en')).toBeHidden();
});

test('the RSVP form posts and the page comes back replied', async ({ page }) => {
  await page.goto('/?g=rsv888');
  await expect(page.locator('#rsvpForm')).toBeVisible();
  await expect(page.locator('.step button').first()).toBeHidden();
  await page.fill('#n-haldi', '1');
  await page.fill('#rsvpName', 'Meera');
  await page.waitForTimeout(2600); /* the server ignores forms sent faster than a person could */
  await page.locator('.r-send').click();
  await expect(page).toHaveURL(/\?g=rsv888#rsvp$/);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'replied');
  await expect(page.locator('.r-summary li')).toHaveText(['Haldi · 1 guest', 'Shaadi · 3 guests']);
  await expect(page.locator('.r-change')).toHaveAttribute('href', '/?g=rsv888&change=1#rsvp');
});
