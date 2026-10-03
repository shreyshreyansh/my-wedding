// The Bodhi leaf: one leaf of the peepal (Ficus religiosa), the Buddha's tree at Bodh Gaya, cut out of a botanical
// print of about 1843 (Wellcome Collection, Public Domain Mark). Used as a small gold ornament (a CSS mask), in the
// leaf toran of the blessing section, and among the petals when a reply is sent.
//   node scripts/leaf.mjs      → public/art/bodhi-leaf.<hash>.webp (then update --leaf in src/styles/base.css)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const URL = 'https://iiif.wellcomecollection.org/image/V0043954/full/full/0/default.jpg';
const CACHE = 'node_modules/.cache/art', OUT = 'public/art';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
mkdirSync(CACHE, { recursive: true });
const src = join(CACHE, 'bodhi-' + createHash('sha256').update(URL).digest('hex').slice(0, 8));
if (!existsSync(src)) execFileSync('curl', ['-sSLf', '--max-time', '300', '-A', UA, '-o', src, URL]);

/* the small leaf at the top right of the plate stands clear of the others */
const meta = await sharp(src).metadata();
const box = { left: Math.round(0.728 * meta.width), top: Math.round(0.098 * meta.height), width: Math.round(0.21 * meta.width), height: Math.round(0.285 * meta.height) };
const { data, info } = await sharp(src).extract(box).raw().toBuffer({ resolveWithObject: true });
const w = info.width, h = info.height, ch = info.channels, N = w * h;
const out = Buffer.alloc(N * 4);
/* the leaf is green and the paper is a pale, greyish cream: tell them apart by how saturated a pixel is (the dark
   outline counts as leaf too) */
for (let p = 0; p < N; p++) {
  const i = p * ch, o = p * 4, r = data[i], g = data[i + 1], b = data[i + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0;
  let a = Math.max(0, Math.min(1, (s - 0.17) / 0.08));
  if (mx < 105) a = 1;
  if (g < r - 6 && s < 0.3) a = 0;
  out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = Math.round(a * 255);
}
const near4 = (p, f) => { const x = p % w, y = (p / w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h && f(Y * w + X)) return true; } return false; };
/* keep the largest solid shape (the leaf) */
const lab = new Int32Array(N).fill(-1), q = new Int32Array(N);
let best = -1, bestN = 0;
for (let s = 0, cur = 0; s < N; s++) {
  if (out[s * 4 + 3] < 128 || lab[s] !== -1) continue;
  let head = 0, tail = 0, n = 0;
  q[tail++] = s; lab[s] = cur;
  while (head < tail) {
    const p = q[head++]; n++;
    const x = p % w, y = (p / w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const X = x + dx, Y = y + dy, t = Y * w + X;
      if (X >= 0 && Y >= 0 && X < w && Y < h && lab[t] === -1 && out[t * 4 + 3] >= 128) { lab[t] = cur; q[tail++] = t; }
    }
  }
  if (n > bestN) { bestN = n; best = cur; }
  cur++;
}
/* everything the background can reach from the edges is background; any hole inside the leaf (a pale vein) is leaf */
const bg = new Uint8Array(N);
let head = 0, tail = 0;
for (let p = 0; p < N; p++) { const x = p % w, y = (p / w) | 0; if ((x === 0 || y === 0 || x === w - 1 || y === h - 1) && lab[p] !== best) { bg[p] = 1; q[tail++] = p; } }
while (head < tail) { const p = q[head++], x = p % w, y = (p / w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, t = Y * w + X; if (X >= 0 && Y >= 0 && X < w && Y < h && !bg[t] && lab[t] !== best) { bg[t] = 1; q[tail++] = t; } } }
for (let p = 0; p < N; p++) out[p * 4 + 3] = bg[p] ? (near4(p, (t) => lab[t] === best) ? Math.min(out[p * 4 + 3], 127) : 0) : 255;

const leaf = await sharp(out, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 1 }).resize({ height: 240 }).webp({ quality: 82, alphaQuality: 90 }).toBuffer();
for (const f of readdirSync(OUT)) if (f.startsWith('bodhi-leaf.')) rmSync(join(OUT, f));
const name = 'bodhi-leaf.' + createHash('sha256').update(leaf).digest('hex').slice(0, 8) + '.webp';
writeFileSync(join(OUT, name), leaf);
const m = await sharp(leaf).metadata();
console.log('/art/' + name, m.width + '×' + m.height, (leaf.length / 1024).toFixed(1) + ' KB');
