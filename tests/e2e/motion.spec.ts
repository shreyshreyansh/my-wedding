// The motion: every scroll animation runs and finishes, no errors, and Gentle motion stops it cleanly.
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
    verseLit: [...document.querySelectorAll('#verse .vw')].every((c) => +getComputedStyle(c).opacity > 0.99),
    rsvpTitle: getComputedStyle(document.querySelector('#rsvp h2')!).opacity === '1',
    invocationShown: getComputedStyle(document.querySelector('#invocation .iv-line')!).opacity === '1'
  }));
  expect(done).toEqual({ chapterTitles: true, platesOpen: true, verseLit: true, rsvpTitle: true, invocationShown: true });
  expect(errors).toEqual([]);
});

test('Gentle motion stops everything in its final state, and full motion comes back', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2600);
  await page.locator('#openBtn').click();
  await expect(page.locator('#cover')).toHaveCount(0, { timeout: 5000 });
  const triggers = () => page.evaluate(() => (window as unknown as { __motion: { ScrollTrigger: { getAll(): unknown[] } } }).__motion.ScrollTrigger.getAll().length);
  expect(await triggers()).toBeGreaterThan(15);
  const btn = page.locator('#motionBtn');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(page.locator('html')).toHaveClass(/\bstill\b/);
  await expect(page.locator('html')).not.toHaveClass(/\bmotion\b/);
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  expect(await triggers()).toBe(0);
  await expect(page.locator('#invocation .iv-line')).toBeVisible();
  await expect(page.locator('.chapter h3').first()).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sm-motion'))).toBe('gentle');
  await btn.click();
  await expect(page.locator('html')).toHaveClass(/\bmotion\b/);
  await expect.poll(triggers).toBeGreaterThan(15);
  expect(await page.evaluate(() => localStorage.getItem('sm-motion'))).toBe('full');
});

test('with Gentle motion chosen, the page opens still and never loads the animation code', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (r) => { if (r.resourceType() === 'script') scripts.push(r.url()); });
  await page.addInitScript(() => localStorage.setItem('sm-motion', 'gentle'));
  await page.goto('/');
  await page.locator('#openBtn').click();
  await expect(page.locator('#cover')).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(scripts.filter((u) => /motion|lenis/.test(u))).toEqual([]);
});
