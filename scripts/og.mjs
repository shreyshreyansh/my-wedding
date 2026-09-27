// Photographs the link-preview card and the icons from the built og-card page.
//   npm run og      → public/og/og.jpg (1200×630, ≤ 280 KB), public/apple-touch-icon.png, public/favicon-32.png
// Commit the results; bump site.ogVersion in src/data/wedding.ts so WhatsApp fetches the new card.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve('dist');
if (!existsSync(join(root, 'og-card/index.html'))) { console.error('dist/og-card is missing: run npm run og (it builds first).'); process.exit(1); }
const TYPES = { '.html': 'text/html', '.woff2': 'font/woff2', '.css': 'text/css', '.js': 'text/javascript' };
const server = createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  let f = join(root, decodeURIComponent(p));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${server.address().port}/og-card/`);
await page.evaluate(() => document.fonts.ready);
mkdirSync('public/og', { recursive: true });
let q = 90, jpg;
do { jpg = await page.locator('#card').screenshot({ type: 'jpeg', quality: q }); q -= 5; } while (jpg.length > 280 * 1024 && q > 50);
writeFileSync('public/og/og.jpg', jpg);
const icon = page.locator('#icon');
const big = await icon.screenshot({ type: 'png' });
/* resize by drawing in the page: 180 for Apple, 32 for the tab */
for (const [size, out] of [[180, 'public/apple-touch-icon.png'], [32, 'public/favicon-32.png']]) {
  const b64 = await page.evaluate(async ([src, size]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, size, size);
    return c.toDataURL('image/png').split(',')[1];
  }, [big.toString('base64'), size]);
  writeFileSync(out, Buffer.from(b64, 'base64'));
}
await browser.close();
server.close();
console.log(`public/og/og.jpg ${(jpg.length / 1024).toFixed(0)} KB (quality ${q + 5}); icons written`);
