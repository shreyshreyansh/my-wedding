// Fails the build when the page gets too heavy, the preview breaks, or anything private reaches dist/.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist', KB = 1024;
const fails = [], rows = [];
const files = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : [p]; });
const all = files(DIST);
const gz = (p) => gzipSync(readFileSync(p), { level: 9 }).length;
const check = (label, value, limit, unit = 'KB') => { rows.push({ check: label, value: (value / KB).toFixed(1) + ' ' + unit, limit: (limit / KB).toFixed(0) + ' ' + unit }); if (value > limit) fails.push(`${label}: ${(value / KB).toFixed(1)} KB is over ${(limit / KB).toFixed(0)} KB`); };

const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const entry = /<script type="module" src="\/(_astro\/[^"]+\.js)"/.exec(html)?.[1];
const js = all.filter((p) => p.endsWith('.js'));
const motion = js.find((p) => /\/motion\.[\w-]+\.js$/.test(p));
const lenis = js.find((p) => /\/lenis\.[\w-]+\.js$/.test(p));
if (!entry || !motion) fails.push('could not find the entry or motion script');

/* what a phone downloads before the cover is fully drawn */
const coverFonts = all.filter((p) => /fonts\/(instrument-serif-(normal|italic)-400-latin|tiro-hindi-normal-400-(latin|devanagari))\.\w+\.woff2$/.test(p));
const phoneJs = (entry ? gz(join(DIST, entry)) : 0) + (motion ? gz(motion) : 0);
check('first view (HTML + JS + cover fonts, gzip)', gz(join(DIST, 'index.html')) + phoneJs + coverFonts.reduce((a, p) => a + statSync(p).size, 0), 300 * KB);
check('JavaScript on a phone (gzip)', phoneJs, 75 * KB);
/* the cover painting a phone fetches: the largest AVIF in the cover's portrait srcset */
const coverImg = /<div id="cover"[\s\S]*?<source type="image\/avif" srcset="([^"]+)"/.exec(html)?.[1];
if (!coverImg) fails.push('could not find the cover painting');
else check('cover painting on a phone', Math.max(...coverImg.split(',').map((c) => statSync(join(DIST, c.trim().split(' ')[0])).size)), 120 * KB);
if (lenis) check('smooth scroll, mouse only (gzip)', gz(lenis), 10 * KB);
/* the museum art comes in several sizes and formats; a guest fetches one of each */
check('everything in dist', all.reduce((a, p) => a + statSync(p).size, 0), 8 * KB * KB);
for (const p of all.filter((p) => /\/audio\//.test(p))) check('audio ' + relative(DIST, p), statSync(p).size, 1000 * 1000);

/* the WhatsApp preview: tags early in the page, the image the right size */
const head = html.slice(0, 4096);
for (const tag of ['og:title', 'og:description', 'og:image', 'og:url', 'og:image:width']) if (!head.includes(`property="${tag}"`)) fails.push(`${tag} is missing from the first 4 KB of the page`);
if (!/name="robots" content="noindex/.test(head)) fails.push('robots noindex is missing');
const og = join(DIST, 'og/og.jpg');
if (!existsSync(og)) fails.push('og/og.jpg is missing (npm run og)');
else {
  const b = readFileSync(og);
  let i = 2, dims = null;
  while (i < b.length) { const m = b[i + 1], len = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc2) { dims = [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; break; } i += 2 + len; }
  if (!dims || dims[0] !== 1200 || dims[1] !== 630) fails.push('og.jpg should be 1200×630, is ' + dims);
  check('og.jpg', b.length, 300 * KB);
}

/* nothing private, nothing that invites crawlers */
for (const p of all) {
  const rel = relative(DIST, p);
  if (/\.(csv|tsv|xlsx?)$/i.test(rel) || /guests?\.json$/i.test(rel)) fails.push('guest data in dist: ' + rel);
  if (/sitemap/i.test(rel)) fails.push('sitemap in dist: ' + rel);
  if (/\.(html|js|txt|json|ics|xml)$/.test(rel)) {
    const t = readFileSync(p, 'utf8');
    if (/wa\.me\/\d/.test(t)) fails.push('a WhatsApp number in ' + rel);
    if (/"party"\s*:/.test(t)) fails.push('guest list data in ' + rel);
    if (/^\s*disallow:/im.test(t) && /robots\.txt$/.test(rel)) fails.push('robots.txt Disallow (it would stop link previews)');
  }
}
/* the mixed page and the one-language pages (/en/, /mr/, /hi/) */
if (process.env.STRICT === '1') for (const p of all.filter((p) => /(^|\/)index\.html$/.test(relative(DIST, p)) && !/og-card/.test(p))) if (/⟦/.test(readFileSync(p, 'utf8'))) fails.push('placeholders ⟦…⟧ left in ' + relative(DIST, p));

console.table(rows);
if (fails.length) { console.error('\nBudget check failed:\n  - ' + fails.join('\n  - ')); process.exit(1); }
console.log('Budget check passed.');
