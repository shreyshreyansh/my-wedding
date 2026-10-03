// Personal links: the edge greets the family, keeps only their events, picks their language; ?name= greets a person.
import { expect, test } from '@playwright/test';
import { noSideways, openCover } from './helpers';

test('without a code: a generic greeting, every event, and a pointer to WhatsApp instead of a form', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-guest-name]')).toHaveText('our family and friends');
  await openCover(page);
  await expect(page.locator('.chapter')).toHaveCount(3);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'nocode');
  await expect(page.locator('.r-nocode')).toBeVisible();
  await expect(page.locator('.r-bad')).toBeHidden();
  await expect(page.locator('#rsvpForm')).toBeHidden();
  await expect(page.locator('#guest')).toHaveCount(0);
});

test('a code that matches nobody adds one quiet line and nothing else', async ({ page }) => {
  await page.goto('/?g=zzzzzz');
  await expect(page.locator('[data-guest-name]')).toHaveText('our family and friends');
  await openCover(page);
  await expect(page.locator('.r-bad')).toBeVisible();
  await expect(page.locator('.chapter')).toHaveCount(3);
});

test('a Hindi family: their name in Devanagari, the Hindi card, all three events, their party size', async ({ page }) => {
  await page.goto('/?g=abc234');
  const name = page.locator('[data-guest-name]');
  await expect(name).toHaveText('शर्मा परिवार');
  await expect(name).toHaveAttribute('lang', 'hi');
  await openCover(page);
  await expect(page.locator('#inv-hi')).toBeChecked();
  await expect(page.locator('.inv-card.c-hi')).toBeVisible();
  await expect(page.locator('.inv-card.c-en')).toBeHidden();
  await expect(page.locator('.chapter')).toHaveCount(3);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'form');
  await expect(page.locator('[data-guest-ask]')).toHaveText('The Sharma family, how many of you will come to each celebration?');
  for (const id of ['haldi', 'sangeet', 'shaadi']) await expect(page.locator('#n-' + id)).toHaveValue('4');
});

test('a Marathi family invited to two events sees only those', async ({ page }) => {
  await page.goto('/?g=mrw567');
  await openCover(page);
  await expect(page.locator('#inv-mr')).toBeChecked();
  await expect(page.locator('.inv-card.c-mr')).toBeVisible();
  await expect(page.locator('.chapter')).toHaveCount(2);
  await expect(page.locator('.chapter[data-event="haldi"]')).toHaveCount(0);
  await expect(page.locator('[data-count-title]')).toHaveText('two celebrations');
  await expect(page.locator('.row[data-event]')).toHaveCount(2);
});

test('invited to the wedding only: one date, one chapter, one RSVP row', async ({ page }) => {
  await page.goto('/?g=pqr789');
  await expect(page.locator('#cover [data-dates-short]')).toHaveText('9 December 2026');
  await openCover(page);
  await expect(page.locator('[data-dates-long]')).toHaveText('Wednesday 9 December 2026');
  await expect(page.locator('[data-count-title]')).toHaveText('one celebration');
  await expect(page.locator('.chapter')).toHaveCount(1);
  await expect(page.locator('.row[data-event="shaadi"]')).toHaveCount(1);
  await expect(page.locator('#inv-en')).toBeChecked();
});

test('a code pasted with capitals and punctuation still works', async ({ page }) => {
  await page.goto('/?g=ABC-234.');
  await expect(page.locator('[data-guest-name]')).toHaveText('शर्मा परिवार');
});

test('a long family name wraps without pushing the page sideways', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/?g=xng456');
  expect(await noSideways(page)).toBe(true);
  await openCover(page);
  await page.locator('#rsvp').scrollIntoViewIfNeeded();
  expect(await noSideways(page)).toBe(true);
});

test('a #rsvp link lands on the RSVP once the cover opens', async ({ page }) => {
  await page.goto('/?g=abc234#rsvp');
  await openCover(page);
  await expect(page.locator('#rsvp h2')).toBeInViewport();
});

test('?name= greets the guest by name on the cover, the invitation, the RSVP and its thank-you', async ({ page }) => {
  await page.goto('/?name=rahul');
  await expect(page.locator('[data-guest-name]')).toHaveText('Rahul');
  await openCover(page);
  await expect(page.locator('#invTitle')).toHaveText('Rahul, you are invited');
  await expect(page.locator('#rsvpTitle')).toHaveText('Will you join us, Rahul?');
  await expect(page.locator('.r-thanks-title')).toHaveText('Thank you, Rahul!');
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'nocode');
});

test('?name= with a family code: the person by name, the family’s events and RSVP', async ({ page }) => {
  await page.goto('/?g=abc234&name=Anjali');
  await expect(page.locator('[data-guest-name]')).toHaveText('Anjali');
  await openCover(page);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'form');
  await expect(page.locator('[data-guest-ask]')).toHaveText(/^Anjali, how many of you/);
  await expect(page.locator('#rsvpName')).toHaveValue('Anjali');
});

test('a name in Devanagari is marked as Hindi; anything that is not a name is left out', async ({ page }) => {
  await page.goto('/?name=' + encodeURIComponent('राहुल'));
  await expect(page.locator('[data-guest-name] span')).toHaveAttribute('lang', 'hi');
  await page.goto('/?name=' + encodeURIComponent('<img src=x onerror=alert(1)>'));
  await expect(page.locator('[data-guest-name] img')).toHaveCount(0);
  await expect(page.locator('[data-guest-name]')).toHaveText('Img Src X Onerror Alert');
  await page.goto('/?name=' + encodeURIComponent('!!!'));
  await expect(page.locator('[data-guest-name]')).toHaveText('our family and friends');
  await openCover(page);
  await expect(page.locator('#invTitle')).toHaveText('You are invited');
  await expect(page.locator('#rsvpTitle')).toHaveText('Will you join us?');
});
