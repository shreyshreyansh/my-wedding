// Cuts the artworks in src/data/art.json down to what a phone needs: each crop at a few widths, AVIF and WebP.
//   npm run art            (all of them)
//   npm run art -- silk    (one)
// The masters come from each museum's open-access server and are kept in node_modules/.cache/art.
// Writes public/art/*.{avif,webp} and src/data/art-files.json (sizes, srcsets and a colour to show while loading).
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

for (const [id, a] of Object.entries(art)) {
  if ((only.length && !only.includes(id)) || !Object.keys(a.crops).length) continue;
  for (const f of readdirSync(OUT)) if (f.startsWith(id + '-')) rmSync(join(OUT, f));
  const src = master(id, a.src);
  const meta = await sharp(src).metadata();
  const out = {};
  for (const [crop, c] of Object.entries(a.crops)) {
    /* a crop may turn the work first (a textile's end bands at the sides on a wide screen); the box is in fractions of the turned image */
    const turned = c.rotate === 90 || c.rotate === 270;
    const [mw, mh] = turned ? [meta.height, meta.width] : [meta.width, meta.height];
    const [x, y, w, h] = c.box;
    const box = { left: Math.round(x * mw), top: Math.round(y * mh), width: Math.round(w * mw), height: Math.round(h * mh) };
    const base = sharp(src).rotate(c.rotate || 0).extract(box);
    const { dominant } = await sharp(await base.clone().resize(64).toBuffer()).stats();
    const set = { w: box.width, h: box.height, colour: '#' + hex(dominant.r) + hex(dominant.g) + hex(dominant.b), avif: [], webp: [] };
    for (const width of c.widths.filter((wd) => wd <= box.width).concat(c.widths.some((wd) => wd > box.width) ? [box.width] : [])) {
      const height = Math.round((box.height * width) / box.width);
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
    console.log(id, crop, box.width + '×' + box.height, set.avif.map(([, wd, b]) => wd + ':' + (b / 1024).toFixed(0) + 'K').join(' '));
  }
  files[id] = out;
}
writeFileSync(FILES, '{\n' + Object.entries(files).map(([id, crops]) => ` "${id}": {\n` + Object.entries(crops).map(([k, v]) => `  "${k}": ${JSON.stringify(v)}`).join(',\n') + '\n }').join(',\n') + '\n}\n');
