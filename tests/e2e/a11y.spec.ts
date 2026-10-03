// Readable and usable for everyone: axe, lang on every Devanagari run, big targets, 18px text, no sideways scroll.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { noSideways, openCover } from './helpers';

for (const url of ['/', '/?g=abc234', '/?g=vsf234']) {
  test(`no serious accessibility problems: ${url}`, async ({ page }) => {
    await page.goto(url);
    const cover = await new AxeBuilder({ page }).analyze();
    await openCover(page);
    const pageRes = await new AxeBuilder({ page }).analyze();
    const bad = [...cover.violations, ...pageRes.violations].filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });
}

test('every run of Devanagari is marked with its language', async ({ page }) => {
  await page.goto('/?g=abc234');
  const unmarked = await page.evaluate(() => {
    const out: string[] = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      /* letters only: the dandas ॥ are punctuation, used in English lines too */
      if (!/[ऀ-ॣ०-ॿ]/.test(n.textContent || '')) continue;
      const lang = n.parentElement?.closest('[lang]')?.getAttribute('lang');
      if (!lang || lang === 'en') out.push((n.textContent || '').trim().slice(0, 30));
    }
    return out;
  });
  expect(unmarked).toEqual([]);
});

test('tap targets are at least 48px', async ({ page }) => {
  await page.goto('/?g=abc234');
  const seal = await page.locator('#openBtn').boundingBox();
  expect(Math.min(seal!.width, seal!.height)).toBeGreaterThanOrEqual(48);
  await openCover(page);
  const small = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('button, a[href], .inv-tabs label, input:not([type=hidden]):not([type=radio]), textarea')]
    .filter((el) => el.offsetParent !== null && !el.closest('.hp'))
    .map((el) => ({ el: el.className || el.tagName, r: el.getBoundingClientRect() }))
    .filter(({ r }) => Math.min(r.width, r.height) < 48)
    .map(({ el, r }) => `${el} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`));
  expect(small).toEqual([]);
});

test('body text is at least 18px on a phone', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone');
  await page.goto('/');
  const sizes = await page.evaluate(() => ['body', '.chapter .story', '.chapter dd', '.gloss', '.inv-in .b-lead'].map((s) => parseFloat(getComputedStyle(document.querySelector(s)!).fontSize)));
  for (const s of sizes) expect(s).toBeGreaterThanOrEqual(18);
});

test('no sideways scrolling on small phones', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone');
  for (const [w, h] of [[360, 800], [375, 667], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/?g=abc234');
    await openCover(page);
    expect(await noSideways(page), `${w}×${h}`).toBe(true);
  }
});

test('opening, switching language and counting add no history entries', async ({ page }) => {
  await page.goto('/?g=abc234');
  const before = await page.evaluate(() => history.length);
  await openCover(page);
  await page.locator('label[for="inv-mr"]').click();
  await page.locator('label[for="inv-en"]').click();
  await page.locator('.row[data-event="haldi"] button[data-d="-1"]').click();
  expect(await page.evaluate(() => history.length)).toBe(before);
});

test('focus: the seal first, then the names once the cover opens', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#openBtn')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#cover')).toHaveCount(0);
  await expect(page.locator('#heroTitle')).toBeFocused();
});

test('focus rings show for keyboard users, not after a tap', async ({ page }) => {
  await page.goto('/');
  const outline = (sel: string) => page.locator(sel).evaluate((el) => getComputedStyle(el).outlineStyle);
  await expect(page.locator('#openBtn')).toBeFocused();
  expect(await outline('#openBtn')).toBe('none');
  await page.keyboard.press('Shift');
  expect(await outline('#openBtn')).toBe('solid');
  await page.locator('#openBtn').click();
  await expect(page.locator('#heroTitle')).toBeFocused();
  expect(await outline('#heroTitle')).toBe('none');
});

test('the night sections keep their dark ground under their gold words', async ({ page }) => {
  /* axe cannot judge contrast over the paper texture, so check the grounds themselves */
  await page.goto('/');
  await openCover(page);
  const grounds = await page.evaluate(() => ['footer', '#mangal'].map((s) => getComputedStyle(document.querySelector(s)!).backgroundColor));
  expect(grounds).toEqual(['rgb(26, 18, 32)', 'rgb(26, 18, 32)']);
});
