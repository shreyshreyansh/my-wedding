// Captures golden screenshots and motion metrics of the prototype or the build under identical conditions
// (seeded Math.random, fixed clock, same fonts), so a port can be checked for visual and motion parity.
//   node tests/golden/capture.mjs prototype tests/golden/out/prototype
//   node tests/golden/capture.mjs build     tests/golden/out/build
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const [target = 'build', outDir = `tests/golden/out/${target}`] = process.argv.slice(2);
const ROOT = resolve(target === 'prototype' ? 'design/prototype' : 'dist');
const VIEWPORTS = [[390, 844], [375, 667], [360, 800], [1440, 900]];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.m4a': 'audio/mp4', '.ics': 'text/calendar' };

// The prototype is a fragment (the artifact viewer adds the document skeleton); give it the same head the build has.
function page(path) {
  if (target === 'prototype' && (path === '/' || path === '/index.html')) {
    return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' + readFileSync(join(ROOT, 'motion-prototype.html'), 'utf8');
  }
  const file = join(ROOT, path === '/' ? 'index.html' : decodeURIComponent(path));
  return existsSync(file) && statSync(file).isFile() ? readFileSync(file) : null;
}
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  const body = page(path);
  if (body === null) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'text/html' });
  res.end(body);
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/`;

// Chromium here can't verify the proxy's certificate, so third-party requests (Google Fonts) go through curl.
const cache = new Map();
const viaCurl = (url) => {
  if (!cache.has(url)) cache.set(url, execFileSync('curl', ['-sSL', '--max-time', '30', url], { maxBuffer: 50e6 }));
  return cache.get(url);
};
const seed = () => {
  let a = 42;
  Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};

async function context(browser, [w, h], reduced) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 600, hasTouch: w < 600, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(seed);
  await ctx.route(/^https:\/\//, async (route) => {
    const u = route.request().url();
    const type = /css2/.test(u) ? 'text/css' : /\.woff2/.test(u) ? 'font/woff2' : 'application/octet-stream';
    try { await route.fulfill({ status: 200, contentType: type, body: viaCurl(u), headers: { 'access-control-allow-origin': '*' } }); } catch { await route.abort(); }
  });
  const pg = await ctx.newPage();
  // A fixed clock steadies the countdown in still frames. GSAP's ticker reads Date.now, so never freeze it with motion on.
  if (reduced) await pg.clock.setFixedTime(new Date('2026-10-27T10:00:00+05:30'));
  const errors = [];
  pg.on('pageerror', (e) => errors.push(e.message));
  await pg.goto(base, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  return { ctx, pg, errors };
}
const open = async (pg, touch, errors = []) => {
  if (process.env.DEBUG) console.log('before open', await pg.evaluate(() => document.getElementById('cover')?.className), errors);
  await (touch ? pg.tap('#openBtn') : pg.click('#openBtn'));
};

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const metrics = {};
for (const vp of VIEWPORTS) {
  const tag = vp.join('x'), touch = vp[0] < 600;

  // Still frames: reduced motion makes every section settle into its final state.
  const r = await context(browser, vp, true);
  await r.pg.waitForTimeout(400);
  await r.pg.screenshot({ path: `${outDir}/${tag}-cover.png` });
  await open(r.pg, touch, r.errors);
  await r.pg.waitForTimeout(600);
  await r.pg.screenshot({ path: `${outDir}/${tag}-page.png`, fullPage: true });
  await r.ctx.close();

  // Full motion: open, scroll through everything, then read what the animations left behind.
  const m = await context(browser, vp, false);
  await m.pg.waitForTimeout(3200);
  await open(m.pg, touch);
  await m.pg.waitForTimeout(3000);
  const H = await m.pg.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 300) { await m.pg.evaluate((y) => window.scrollTo(0, y), y); await m.pg.waitForTimeout(90); }
  await m.pg.waitForTimeout(800);
  metrics[tag] = await m.pg.evaluate(() => ({
    triggers: window.ScrollTrigger ? ScrollTrigger.getAll().length : 0,
    pinned: window.ScrollTrigger ? ScrollTrigger.getAll().filter((s) => s.pin).length : 0,
    chapterTitles: [...document.querySelectorAll('.chapter h3 .ch')].every((c) => getComputedStyle(c).opacity === '1'),
    verseLit: [...document.querySelectorAll('#verse .vw')].every((c) => +getComputedStyle(c).opacity > 0.99),
    threadsDrawn: [...document.querySelectorAll('.threads path')].every((p) => parseFloat(p.style.strokeDashoffset || '0') < 0.01),
    rsvpTitle: [...document.querySelectorAll('#rsvp h2 .ch')].every((c) => getComputedStyle(c).opacity === '1'),
  }));
  metrics[tag].errors = m.errors.concat(r.errors);
  await m.ctx.close();
  console.log(tag, JSON.stringify(metrics[tag]));
}
writeFileSync(`${outDir}/metrics.json`, JSON.stringify(metrics, null, 2));
await browser.close();
server.close();
