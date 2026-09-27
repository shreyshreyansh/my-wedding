// Quick screenshots of sections for review: node tests/tools/shots.mjs <url> <outdir> [w] [h] [selectors...]
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const [url, out, w = '390', h = '844', ...sels] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2, isMobile: +w < 600, hasTouch: +w < 600, reducedMotion: process.env.MOTION ? 'no-preference' : 'reduce' });
const cache = new Map();
await ctx.route(/^https:\/\/fonts\./, async (r) => {
  const u = r.request().url();
  if (!cache.has(u)) cache.set(u, execFileSync('curl', ['-sSL', '--max-time', '30', u], { maxBuffer: 5e7 }));
  await r.fulfill({ status: 200, contentType: /css2/.test(u) ? 'text/css' : 'font/woff2', body: cache.get(u), headers: { 'access-control-allow-origin': '*' } });
});
const pg = await ctx.newPage();
pg.on('pageerror', (e) => console.log('PAGEERROR', e.message));
pg.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await pg.goto(url);
await pg.evaluate(() => document.fonts.ready);
await pg.waitForTimeout(600);
await pg.screenshot({ path: `${out}/cover.png` });
const btn = await pg.$('#openBtn');
if (btn) { await (+w < 600 ? pg.tap('#openBtn') : pg.click('#openBtn')); await pg.waitForTimeout(1800); }
for (const s of sels) {
  const el = await pg.$(s);
  if (!el) { console.log('missing', s); continue; }
  await el.scrollIntoViewIfNeeded();
  await pg.waitForTimeout(300);
  await el.screenshot({ path: `${out}/${s.replace(/[^a-z0-9]+/gi, '_')}.png` });
}
await browser.close();
