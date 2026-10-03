// The cut-down fonts must draw exactly what Google's whole fonts draw: every letter and conjunct, in every language.
// Hinting is off, as on phones (iOS and Android place glyphs without it); `npm run fonts` keeps Google's files to compare with.
import { chromium, expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = 'node_modules/.cache/fonts';

async function useWholeFonts(page: Page) {
  const css = readFileSync(join(CACHE, 'ref.css'), 'utf8');
  await page.route('**/ref-fonts/*', (r) => r.fulfill({ body: readFileSync(join(CACHE, r.request().url().split('/').pop()!)), contentType: 'font/woff2' }));
  await page.route(/127\.0\.0\.1:8788\/(\?.*)?$/, async (r) => {
    const res = await r.fetch();
    const html = (await res.text()).replace(/@font-face\{[^}]*\}/g, '').replace(/<link rel="preload"[^>]*as="font"[^>]*>/g, '').replace('</head>', `<style>${css}</style></head>`);
    await r.fulfill({ response: res, body: html });
  });
}

async function frames(page: Page) {
  await page.goto('/?g=abc234');
  await page.evaluate(() => document.fonts.ready);
  const out: Record<string, Buffer> = {};
  for (const s of ['#cover .cv-top', '#cover .seal', '#cover .cv-mid']) out[s] = await page.locator(s).screenshot();
  await page.locator('#openBtn').click();
  for (const l of ['en', 'mr', 'hi']) {
    await page.locator(`label[for="inv-${l}"]`).click();
    await page.evaluate(() => document.fonts.ready);
    out['invite-' + l] = await page.locator(`.inv-card.c-${l}`).screenshot();
  }
  for (const s of ['#hero .h-in', '#invocation .iv-text', '.ch-haldi .ch-text', '.ch-sangeet .ch-text', '.ch-shaadi .ch-text', '#mangal .mg-inner', '#rsvp .rsvp', 'footer .foot', '#schedule .sched-head']) {
    await page.locator(s).scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    out[s] = await page.locator(s).screenshot({ mask: [page.locator('#controls')] });
  }
  return out;
}

async function diff(page: Page, a: Buffer, b: Buffer) {
  return page.evaluate(async ([a, b]) => {
    const load = async (s: string) => createImageBitmap(await (await fetch('data:image/png;base64,' + s)).blob());
    const [x, y] = [await load(a), await load(b)];
    if (x.width !== y.width || x.height !== y.height) return 1;
    const px = (img: ImageBitmap) => { const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext('2d')!; g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data; };
    const [p, q] = [px(x), px(y)];
    let bad = 0;
    for (let i = 0; i < p.length; i += 4) if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 24) bad++;
    return bad / (p.length / 4);
  }, [a.toString('base64'), b.toString('base64')]);
}

test('subset fonts draw the page exactly as the whole fonts do', async ({}, info) => {
  test.skip(info.project.name !== 'phone');
  test.skip(!existsSync(join(CACHE, 'ref.css')), 'run `npm run fonts` first');
  const browser = await chromium.launch({ args: ['--font-render-hinting=none'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', baseURL: 'http://127.0.0.1:8788' });
  const ours = await frames(await ctx.newPage());
  const wholePage = await ctx.newPage();
  await useWholeFonts(wholePage);
  const whole = await frames(wholePage);
  const scratch = await ctx.newPage();
  const diffs: Record<string, number> = {};
  for (const k of Object.keys(ours)) diffs[k] = await diff(scratch, ours[k], whole[k]);
  await browser.close();
  expect(Object.entries(diffs).filter(([, v]) => v > 0)).toEqual([]);
});
