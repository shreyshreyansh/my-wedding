// Every screen size, phones to large desktops, tablets and landscape phones included: the cover fits, nothing
// spills sideways, the names fit their line, and every painting tour really zooms in and shows its words.
import { expect, test, type Page } from '@playwright/test';
import { openCover } from './helpers';

test.use({ contextOptions: { reducedMotion: 'no-preference' } });

const SIZES: [number, number, string][] = [
  [320, 568, 'small phone'], [390, 844, 'phone'], [412, 915, 'large phone'], [844, 390, 'phone, landscape'],
  [600, 960, 'small tablet'], [768, 1024, 'tablet'], [820, 1180, 'tablet, tall'], [1024, 768, 'tablet, landscape'],
  [1024, 1366, 'large tablet'], [1280, 800, 'laptop'], [1920, 1080, 'large desktop']
];

const inView = (page: Page, sel: string) => page.locator(sel).evaluate((el) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1;
});

for (const [w, h, name] of SIZES) {
  test(`${name} (${w}×${h}): cover, names and painting tours`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/?g=abc234');
    await page.waitForTimeout(3200);
    for (const sel of ['#openBtn', '#cover .cv-names', '#cover [data-guest-name]', '#cover .cv-date']) expect(await inView(page, sel), `${sel} is on screen`).toBe(true);
    await openCover(page);
    await page.waitForTimeout(1600);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no sideways scrolling').toBe(true);
    const names = await page.$$eval('#hero .h-who .nm', (els) => els.map((e) => e.getBoundingClientRect().right <= innerWidth + 1 && e.getBoundingClientRect().left >= -1));
    expect(names, 'the names fit their line').toEqual([true, true]);

    const tours = await page.$$eval('.tour', (els) => els.map((t) => ({ top: t.getBoundingClientRect().top + scrollY, len: t.getBoundingClientRect().height - innerHeight, n: JSON.parse((t as HTMLElement).dataset.tour!).length })));
    expect(tours.length).toBe(4);
    for (const [i, t] of tours.entries()) {
      /* the first detail is fully in view about a quarter of the way through */
      const y = t.top + t.len * (1.85 / (0.5 + t.n * 1.7 + 1.3));
      await page.evaluate((y) => window.scrollTo(0, y - 400), y);
      await page.waitForTimeout(250);
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(1300);
      const state = await page.evaluate((i) => {
        const tour = document.querySelectorAll('.tour')[i];
        const art = tour.querySelector('.tour-art')!, cap = tour.querySelector('.tour-list .tour-cap')!;
        const scale = new DOMMatrix(getComputedStyle(art).transform).a;
        const r = cap.getBoundingClientRect(), pin = tour.querySelector('.tour-pin')!.getBoundingClientRect();
        return { scale, capOpacity: +getComputedStyle(cap).opacity, capInside: r.top >= pin.top - 1 && r.bottom <= pin.bottom + 1 && r.right <= innerWidth + 1 };
      }, i);
      expect(state.scale, `tour ${i + 1} zooms in`).toBeGreaterThan(1.3);
      expect(state.capOpacity, `tour ${i + 1} shows its first words`).toBeGreaterThan(0.9);
      expect(state.capInside, `tour ${i + 1}'s words are inside the frame`).toBe(true);
    }
  });
}
