// The motion: every scroll animation runs and finishes with no errors; with Reduce Motion on, none of it loads.
import { expect, test, type Page } from '@playwright/test';

test.use({ contextOptions: { reducedMotion: 'no-preference' } });

async function scrollThrough(page: Page, sample?: () => Promise<void>) {
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 300) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(90);
    if (sample) await sample();
  }
  await page.waitForTimeout(800);
}

test('every scroll animation moves and ends in its final state, with no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/?g=abc234');
  await expect(page.locator('#openBtn')).toBeVisible();
  await page.waitForTimeout(2600);
  await page.locator('#openBtn').click();
  await expect(page.locator('#cover')).toHaveCount(0, { timeout: 5000 });
  await page.waitForTimeout(1500);
  const count = await page.evaluate(() => {
    const w = window as unknown as { __motion: { ScrollTrigger: { getAll(): { progress: number }[] } }; __trig: { progress: number }[]; __seen: Set<string>[] };
    w.__trig = w.__motion.ScrollTrigger.getAll().slice();
    w.__seen = w.__trig.map((t) => new Set([t.progress.toFixed(3)]));
    return w.__trig.length;
  });
  expect(count).toBeGreaterThan(15);
  await scrollThrough(page, () => page.evaluate(() => {
    const w = window as unknown as { __trig: { progress: number }[]; __seen: Set<string>[] };
    w.__trig.forEach((t, i) => w.__seen[i].add(t.progress.toFixed(3)));
  }));
  const still = await page.evaluate(() => {
    const w = window as unknown as { __trig: { trigger?: Element; vars: { id?: string } }[]; __seen: Set<string>[] };
    return w.__seen.map((s, i) => (s.size < 2 ? (w.__trig[i].trigger as HTMLElement | undefined)?.id || (w.__trig[i].trigger as HTMLElement | undefined)?.className || 'window' : null)).filter(Boolean);
  });
  expect(still, 'triggers whose progress never changed').toEqual([]);
  const done = await page.evaluate(() => ({
    chapterTitles: [...document.querySelectorAll('.chapter h3')].every((c) => getComputedStyle(c).opacity === '1'),
    platesOpen: [...document.querySelectorAll('.tour-stage')].every((p) => /^inset\(0(px|%)?( 0(px|%)?)*\)$|^none$/.test(getComputedStyle(p).clipPath)),
    verseLit: [...document.querySelectorAll('#verse .vw, #verse2 .vw, #gloss .gw, #gloss2 .gw')].every((c) => +getComputedStyle(c).opacity > 0.99),
    rsvpTitle: getComputedStyle(document.querySelector('#rsvp h2')!).opacity === '1',
    invocationShown: getComputedStyle(document.querySelector('#invocation .iv-line')!).opacity === '1'
  }));
  expect(done).toEqual({ chapterTitles: true, platesOpen: true, verseLit: true, rsvpTitle: true, invocationShown: true });
  expect(errors).toEqual([]);
});

test('with Reduce Motion on, the page opens still and never loads the animation code', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', baseURL: test.info().project.use.baseURL });
  const page = await ctx.newPage();
  const scripts: string[] = [];
  page.on('request', (r) => { if (r.resourceType() === 'script') scripts.push(r.url()); });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/\bstill\b/);
  await page.locator('#openBtn').click();
  await expect(page.locator('#cover')).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(scripts.filter((u) => /motion|lenis/.test(u))).toEqual([]);
  await expect(page.locator('#invocation .iv-line')).toBeVisible();
  await expect(page.locator('.chapter h3').first()).toBeVisible();
  await ctx.close();
});

test('there is no motion switch to find: the phone setting decides', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#motionBtn')).toHaveCount(0);
});

/* Phones run out of graphics memory long before laptops do. Two things once made scrolling lag on a phone: paused
   animations (every leaf and spark kept a layer all the way down the page), and the pinned paintings, which made the
   phone lift the rest of the page into layers thousands of pixels tall. */
test('a phone holds few layers, none much taller than the screen', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'phone');
  await page.goto('/?g=abc234');
  await page.waitForTimeout(2600);
  await page.locator('#openBtn').click();
  await expect(page.locator('#cover')).toHaveCount(0, { timeout: 5000 });
  const cdp = await context.newCDPSession(page);
  let layers: { width: number; height: number; drawsContent: boolean; layerId: string; parentLayerId?: string }[] = [];
  cdp.on('LayerTree.layerTreeDidChange', (e) => { if (e.layers) layers = e.layers as typeof layers; });
  await cdp.send('LayerTree.enable');
  const [H, doc] = await page.evaluate(() => [innerHeight, document.documentElement.scrollHeight]);
  for (const s of ['#tour-homes', '#tour-sangeet', '#rsvp']) {
    await page.evaluate((s) => scrollTo(0, document.querySelector(s)!.getBoundingClientRect().top + scrollY + 600), s);
    await page.waitForTimeout(1200);
    const drawing = layers.filter((l) => l.drawsContent && l.height < doc - 1); /* the page itself is as tall as the document */
    expect(drawing.length, s).toBeLessThan(40);
    expect(drawing.filter((l) => l.height > 2 * H).map((l) => `${Math.round(l.width)}×${Math.round(l.height)}`), s).toEqual([]);
  }
});
