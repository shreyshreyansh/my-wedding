// Compares two golden captures pixel by pixel (in the browser, no extra dependencies) and diffs their motion metrics.
//   node tests/golden/compare.mjs tests/golden/out/prototype tests/golden/out/build
import { chromium } from '@playwright/test';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const [a, b, diffDir = 'tests/golden/out/diff'] = process.argv.slice(2);
mkdirSync(diffDir, { recursive: true });
const browser = await chromium.launch();
const pg = await browser.newPage();
let failed = false;
for (const name of readdirSync(a).filter((f) => f.endsWith('.png'))) {
  const res = await pg.evaluate(async ([x, y]) => {
    const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
    const [ia, ib] = await Promise.all([load(x), load(y)]);
    const w = Math.max(ia.width, ib.width), h = Math.max(ia.height, ib.height);
    const draw = (img) => { const c = new OffscreenCanvas(w, h), g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h).data; };
    const da = draw(ia), db = draw(ib), out = new OffscreenCanvas(w, h), og = out.getContext('2d'), od = og.createImageData(w, h);
    let diff = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
      if (d > 24) { diff++; od.data[i] = 255; od.data[i + 3] = 255; } else { od.data[i] = od.data[i + 1] = od.data[i + 2] = da[i] * 0.3 + 170; od.data[i + 3] = 255; }
    }
    og.putImageData(od, 0, 0);
    const blob = await out.convertToBlob();
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = ''; for (const c of buf) s += String.fromCharCode(c);
    return { sizeA: [ia.width, ia.height], sizeB: [ib.width, ib.height], ratio: diff / (w * h), png: btoa(s) };
  }, ['data:image/png;base64,' + readFileSync(`${a}/${name}`).toString('base64'), 'data:image/png;base64,' + readFileSync(`${b}/${name}`).toString('base64')]);
  writeFileSync(`${diffDir}/${name}`, Buffer.from(res.png, 'base64'));
  const ok = res.ratio <= 0.001 && res.sizeA.join() === res.sizeB.join();
  if (!ok) failed = true;
  console.log(`${ok ? 'same' : 'DIFF'}  ${name}  ${(res.ratio * 100).toFixed(3)}% of pixels  ${res.sizeA.join('x')} vs ${res.sizeB.join('x')}`);
}
const ma = JSON.parse(readFileSync(`${a}/metrics.json`, 'utf8')), mb = JSON.parse(readFileSync(`${b}/metrics.json`, 'utf8'));
for (const k of Object.keys(ma)) {
  const same = JSON.stringify(ma[k]) === JSON.stringify(mb[k]);
  if (!same) failed = true;
  console.log(`${same ? 'same' : 'DIFF'}  motion ${k}: ${JSON.stringify(mb[k])}`);
}
await browser.close();
process.exit(failed ? 1 : 0);
