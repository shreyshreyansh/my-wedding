// Saves the morning scene's layers (src/art/sunrise.ts) as files the page loads:
//   the sky as AVIF + WebP pictures, in a tall crop for phones and the whole frame for wider screens;
//   the far hills, the temple hills, the river and the night river as SVG files (their ids stay inside them).
// Writes public/scene/* and src/data/scene-files.json. Run after changing the art:  npm run scene
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { scene, nightScene, ghatSteps } from '../src/art/sunrise.ts';

const OUT = 'public/scene';
if (existsSync(OUT)) for (const f of readdirSync(OUT)) rmSync(join(OUT, f));
mkdirSync(OUT, { recursive: true });
const hash = (b) => createHash('sha256').update(b).digest('hex').slice(0, 8);
const save = (name, ext, buf) => { const f = `${name}.${hash(buf)}.${ext}`; writeFileSync(join(OUT, f), buf); return '/scene/' + f; };

const s = scene();
/* the tall crop: the middle 750 of the 1600-wide frame, which is all a portrait screen ever shows */
const CROPS = { tall: { vb: '425 0 750 1000', w: 750, widths: [540, 720, 1080] }, wide: { vb: '0 0 1600 1000', w: 1600, widths: [1280, 1920, 2560] } };
const sky = {};
for (const [name, c] of Object.entries(CROPS)) {
  const svg = s.sky.replace(/viewBox="[^"]+"/, `viewBox="${c.vb}"`).replace(/preserveAspectRatio="[^"]+"/, 'preserveAspectRatio="none"');
  sky[name] = { avif: [], webp: [] };
  for (const w of c.widths) {
    const img = sharp(Buffer.from(svg), { density: (72 * w) / c.w }).resize(w);
    /* tall crops a little richer: Chrome skips a picture as the page's largest paint when it is too few bits per pixel */
    const avif = await img.clone().avif({ quality: name === 'tall' ? 66 : 56, effort: 6 }).toBuffer();
    const webp = await img.clone().webp({ quality: 74 }).toBuffer();
    sky[name].avif.push([save(`sky-${name}-${w}`, 'avif', avif), w, avif.length]);
    sky[name].webp.push([save(`sky-${name}-${w}`, 'webp', webp), w, webp.length]);
  }
}
const files = { sky, far: save('far', 'svg', s.far), mid: save('mid', 'svg', s.mid), near: save('near', 'svg', s.near), ghat: save('ghat', 'svg', ghatSteps()), night: save('night', 'svg', nightScene()) };
writeFileSync('src/data/scene-files.json', JSON.stringify(files, null, 2) + '\n');
for (const [k, v] of Object.entries(files)) console.log(k.padEnd(6), typeof v === 'string' ? v : Object.entries(v).map(([c, f]) => c + ' ' + f.avif.map(([, w, b]) => w + ':' + (b / 1024).toFixed(1) + 'KB').join(' ')).join(' | '));
