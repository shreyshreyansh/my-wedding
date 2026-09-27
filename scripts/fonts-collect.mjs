// Which characters does each font face draw? Opens the built page and reads every text node's computed font.
// Used by scripts/fonts.mjs; run after `npm run build`.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
export const OURS = ['Amita', 'Tiro Devanagari Hindi', 'Tiro Devanagari Marathi'];

export async function collect(dir = 'dist') {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    const f = join(root, p === '/' ? 'index.html' : decodeURIComponent(p));
    if (!existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
    res.end(readFileSync(f));
  }).listen(0);
  const browser = await chromium.launch();
  const out = {};
  try {
    for (const width of [390, 1440]) {
      const pg = await browser.newPage({ viewport: { width, height: 900 } });
      await pg.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
      await pg.goto(`http://127.0.0.1:${server.address().port}/`);
      const faces = await pg.evaluate((ours) => {
        const res = {};
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement;
          if (!el || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName) || !n.textContent.trim()) continue;
          const cs = getComputedStyle(el);
          const fam = cs.fontFamily.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).find((s) => ours.includes(s));
          if (!fam) continue;
          const style = cs.fontStyle === 'normal' ? 'normal' : 'italic';
          const weight = fam === 'Amita' && Number(cs.fontWeight) >= 600 ? 700 : 400;
          const key = fam + '|' + style + '|' + weight;
          res[key] = (res[key] || '') + n.textContent + (cs.textTransform === 'uppercase' ? n.textContent.toUpperCase() : '');
        }
        return res;
      }, OURS);
      for (const [k, t] of Object.entries(faces)) out[k] = (out[k] || '') + t;
      await pg.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  for (const k of Object.keys(out)) out[k] = [...new Set(out[k])].sort().join('');
  return out;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const faces = await collect(process.argv[2]);
  for (const [k, t] of Object.entries(faces)) console.log(k.padEnd(36), t.length, 'chars');
}
