// Cuts the artworks in src/data/art.json down to what a phone needs: each crop at a few widths, AVIF and WebP.
//   npm run art            (all of them)
//   npm run art -- silk    (one)
// The masters come from each museum's open-access server and are kept in node_modules/.cache/art.
// Writes public/art/*.{avif,webp} and src/data/art-files.json (sizes, srcsets, and a colour and tiny sketch to show while loading).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const CACHE = 'node_modules/.cache/art', OUT = 'public/art', FILES = 'src/data/art-files.json';
/* some museum servers turn away anything that doesn't look like a browser */
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
const art = JSON.parse(readFileSync('src/data/art.json', 'utf8'));
const only = process.argv.slice(2);
const files = existsSync(FILES) ? JSON.parse(readFileSync(FILES, 'utf8')) : {};

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const master = (id, url) => {
  const file = join(CACHE, id + '-' + createHash('sha256').update(url).digest('hex').slice(0, 8));
  if (!existsSync(file)) execFileSync('curl', ['-sSLfg', '--max-time', '600', '-A', UA, '-o', file, url]);
  return file;
};
const hex = (n) => n.toString(16).padStart(2, '0');

/* An object photographed on a plain grey backdrop (a museum's studio shot), lifted off it so it stands on the page's
   paper like the paintings. The backdrop is found from the edges inward: neutral grey pixels (no warmth, little
   colour), judged on a softened copy so JPEG noise in the dark doesn't read as colour. Shadows inside the carving are
   warm and stay. The edge is softened by a pixel. Returns an RGBA PNG of the whole master. */
async function cutout(src, { warmth = 6, saturation = 0.14 } = {}) {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info, N = W * H;
  const soft = await sharp(src).removeAlpha().blur(2).raw().toBuffer();
  const grey = new Uint8Array(N);
  for (let p = 0, i = 0; p < N; p++, i += 3) {
    const r = soft[i], g = soft[i + 1], b = soft[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    grey[p] = r - b < warmth && (mx ? (mx - mn) / mx : 0) < saturation ? 1 : 0;
  }
  const bg = new Uint8Array(N), queue = new Int32Array(N);
  let head = 0, tail = 0;
  const take = (p) => { if (grey[p] && !bg[p]) { bg[p] = 1; queue[tail++] = p; } };
  for (let x = 0; x < W; x++) { take(x); take(N - W + x); }
  for (let y = 0; y < H; y++) { take(y * W); take(y * W + W - 1); }
  while (head < tail) {
    const p = queue[head++], x = p % W;
    if (x) take(p - 1);
    if (x < W - 1) take(p + 1);
    if (p >= W) take(p - W);
    if (p < N - W) take(p + W);
  }
  const mask = Buffer.alloc(N);
  for (let p = 0; p < N; p++) mask[p] = bg[p] ? 0 : 255;
  /* soften the edge and pull it in a pixel, so no grey fringe is left */
  const alpha = await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).blur(1.2).linear(1.6, -140).extractChannel(0).raw().toBuffer();
  const rgba = Buffer.alloc(N * 4);
  for (let p = 0; p < N; p++) { rgba[p * 4] = data[p * 3]; rgba[p * 4 + 1] = data[p * 3 + 1]; rgba[p * 4 + 2] = data[p * 3 + 2]; rgba[p * 4 + 3] = alpha[p]; }
  return sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

for (const [id, a] of Object.entries(art)) {
  if ((only.length && !only.includes(id)) || !Object.keys(a.crops).length) continue;
  for (const f of readdirSync(OUT)) if (f.startsWith(id + '-')) rmSync(join(OUT, f));
  const src = a.cutout ? await cutout(master(id, a.src), a.cutout) : master(id, a.src);
  const meta = await sharp(src).metadata();
  const out = {};
  for (const [crop, c] of Object.entries(a.crops)) {
    /* a crop may turn the work first (a textile's end bands at the sides on a wide screen); the box is in fractions of the turned image */
    const turned = c.rotate === 90 || c.rotate === 270;
    const [mw, mh] = turned ? [meta.height, meta.width] : [meta.width, meta.height];
    const [x, y, w, h] = c.box;
    const box = { left: Math.round(x * mw), top: Math.round(y * mh), width: Math.round(w * mw), height: Math.round(h * mh) };
    let base = sharp(src).rotate(c.rotate || 0).extract(box);
    /* pad: clear space each side, as a fraction of the crop's width (a tall cut-out keeps a wide pair from shrinking) */
    const pad = c.pad ? Math.round(c.pad * box.width) : 0;
    /* made into a new image first: sharp would otherwise resize before it extends */
    if (pad) base = sharp(await sharp(await base.png().toBuffer()).extend({ left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer());
    const bw = box.width + 2 * pad;
    const { dominant } = await sharp(await base.clone().resize(64).toBuffer()).stats();
    /* a 24 px sketch of the painting, inlined in the page and blurred while the real one loads */
    const lqip = 'data:image/webp;base64,' + (await base.clone().resize(24).webp({ quality: 50 }).toBuffer()).toString('base64');
    /* a cut-out object has the page behind it while it loads, not a block of its colour */
    const set = { w: bw, h: box.height, colour: a.cutout ? 'transparent' : '#' + hex(dominant.r) + hex(dominant.g) + hex(dominant.b), lqip, avif: [], webp: [] };
    for (const width of c.widths.filter((wd) => wd <= bw).concat(c.widths.some((wd) => wd > bw) ? [bw] : [])) {
      const height = Math.round((box.height * width) / bw);
      /* a woven photo is mostly thread noise: a small median keeps the pattern's edges and halves the file */
      let sized = base.clone().resize(width, height, { kernel: 'lanczos3' });
      if (c.median) sized = sized.median(c.median);
      /* the largest widths are only for zooming into a painting's details: they can take a lower quality */
      const big = width > 1200 && c.q?.big;
      for (const [fmt, opts] of [['avif', { quality: big || (c.q?.avif ?? 52), effort: 4 }], ['webp', { quality: c.q?.webp ?? 76, effort: 6 }]]) {
        /* WebP is only for browsers without AVIF: the smaller widths are enough */
        if (fmt === 'webp' && c.webp && !c.webp.includes(width)) continue;
        const data = await sized.clone()[fmt](opts).toBuffer();
        const name = `${id}-${crop}-${width}.${createHash('sha256').update(data).digest('hex').slice(0, 8)}.${fmt}`;
        writeFileSync(join(OUT, name), data);
        set[fmt].push(['/art/' + name, width, data.length]);
      }
    }
    out[crop] = set;
    console.log(id, crop, bw + '×' + box.height, set.avif.map(([, wd, b]) => wd + ':' + (b / 1024).toFixed(0) + 'K').join(' '));
  }
  files[id] = out;
}
writeFileSync(FILES, '{\n' + Object.entries(files).map(([id, crops]) => ` "${id}": {\n` + Object.entries(crops).map(([k, v]) => `  "${k}": ${JSON.stringify(v)}`).join(',\n') + '\n }').join(',\n') + '\n}\n');
