// Self-hosts the three typefaces, cut down to what the page draws.
//   npm run build && npm run fonts && npm run build
// Latin files are kept whole (guest names can be anything). Devanagari files are subset to the characters each face
// draws on the page, keeping every conjunct those characters can form; Amita Bold keeps its whole Devanagari set
// because it draws the families' names on the cover. Hints are dropped: phones ignore them, and they double the size.
// Needs Python with fonttools and brotli:
//   pip install fonttools brotli
// Writes public/fonts/*.woff2, src/styles/fonts.css and src/data/fonts.json (the files to preload).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { collect } from './fonts-collect.mjs';

const CSS_URL = 'https://fonts.googleapis.com/css2?family=Amita:wght@400;700&family=Tiro+Devanagari+Hindi:ital@0;1&family=Tiro+Devanagari+Marathi:ital@0;1';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
const CACHE = 'node_modules/.cache/fonts', OUT = 'public/fonts';
/* the cover's faces, fetched first */
const PRELOAD = ['Amita|normal|700|latin', 'Amita|normal|700|devanagari', 'Tiro Devanagari Hindi|normal|400|latin'];
const KEEP_WHOLE = ['Amita|normal|700|devanagari'];
/* always kept with any Devanagari: joiners, dandas, the Vedic-free basics a name might need */
const DEVA_EXTRA = '‌‍।॥◌';

mkdirSync(CACHE, { recursive: true });
const get = (url, file) => {
  if (!existsSync(file)) execFileSync('curl', ['-sSLf', '--max-time', '60', '-A', UA, '-o', file, url]);
  return readFileSync(file);
};

/* 1. what the page draws, per face (Amita has no italic: the browser slants the upright face) */
const drawn = {};
for (const [k, t] of Object.entries(await collect('dist'))) {
  const [fam, style, weight] = k.split('|');
  const key = fam === 'Amita' ? `${fam}|normal|${weight}` : k;
  drawn[key] = (drawn[key] || '') + t;
}

/* 2. Google's @font-face blocks */
const css = get(CSS_URL, join(CACHE, 'google.css')).toString();
const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*{([^}]*)}/g)].map(([, subset, body]) => ({
  subset,
  family: /font-family:\s*'([^']+)'/.exec(body)[1],
  style: /font-style:\s*(\w+)/.exec(body)[1],
  weight: /font-weight:\s*(\d+)/.exec(body)[1],
  url: /url\(([^)]+)\)/.exec(body)[1],
  range: /unicode-range:\s*([^;]+);/.exec(body)[1].trim()
}));

const inRange = (range, cp) => range.split(',').some((r) => {
  const [a, b] = r.trim().replace(/^U\+/i, '').split('-').map((h) => parseInt(h.replace(/\?/g, '0'), 16));
  return cp >= a && cp <= (b ?? a);
});
const toRange = (cps) => {
  const s = [...new Set(cps)].sort((a, b) => a - b), out = [];
  for (let i = 0; i < s.length; i++) {
    let j = i;
    while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++;
    const h = (n) => n.toString(16).toUpperCase();
    out.push(i === j ? 'U+' + h(s[i]) : 'U+' + h(s[i]) + '-' + h(s[j]));
    i = j;
  }
  return out.join(', ');
};
const slug = (b) => `${b.family.toLowerCase().replace(/ devanagari /, '-').replace(/\s+/g, '-')}-${b.style}-${b.weight}-${b.subset}`;

if (existsSync(OUT)) for (const f of readdirSync(OUT)) if (f.endsWith('.woff2')) rmSync(join(OUT, f));
mkdirSync(OUT, { recursive: true });
const faces = [], refs = [], preload = [], table = [];
for (const b of blocks) {
  const face = `${b.family}|${b.style}|${b.weight}`, id = `${face}|${b.subset}`;
  const text = drawn[face];
  if (!text) continue; /* the page never uses this face */
  const src = join(CACHE, slug(b) + '.woff2');
  get(b.url, src);
  let data = readFileSync(src), range = b.range;
  if (b.subset === 'devanagari' && !KEEP_WHOLE.includes(id)) {
    const all = [...new Set([...text + DEVA_EXTRA + ' \u00a0'].map((c) => c.codePointAt(0)))];
    const cps = all.filter((cp) => inRange(b.range, cp));
    if (!cps.length) continue;
    const tmp = join(CACHE, slug(b) + '.subset.woff2');
    /* keep every character this face draws, spaces and punctuation too (Chrome shapes a Devanagari run's spaces
       with the run's own face, and its kerning refers to them); the unicode-range below stays Devanagari-only */
    execFileSync('python3', ['-m', 'fontTools.subset', src, '--unicodes=' + all.map((c) => c.toString(16)).join(','), "--layout-features=*", '--flavor=woff2', '--output-file=' + tmp, '--no-hinting', '--desubroutinize'], { stdio: 'inherit' });
    data = readFileSync(tmp);
    range = toRange(cps);
    /* Google's own file: what tests/e2e/glyphs.spec.ts compares the cut-down face against */
    refs.push(`@font-face{font-family:'${b.family}';font-style:${b.style};font-weight:${b.weight};font-display:block;src:url(/ref-fonts/${slug(b)}.woff2) format('woff2');unicode-range:${b.range}}`);
  } else if (b.subset === 'latin') {
    /* spaces and punctuation come from here even in Devanagari text */
    if (![...text].some((c) => inRange(b.range, c.codePointAt(0)))) continue;
  } else if (!/[A-Za-z]/.test(text)) {
    /* latin-ext stays available for names with accents, if the face draws Latin at all */
    continue;
  }
  const name = `${slug(b)}.${createHash('sha256').update(data).digest('hex').slice(0, 8)}.woff2`;
  writeFileSync(join(OUT, name), data);
  faces.push(`@font-face{font-family:'${b.family}';font-style:${b.style};font-weight:${b.weight};font-display:swap;src:url(/fonts/${name}) format('woff2');unicode-range:${range}}`);
  if (!(b.subset === 'devanagari' && !KEEP_WHOLE.includes(id))) refs.push(faces[faces.length - 1].replace('font-display:swap', 'font-display:block'));
  if (PRELOAD.includes(id)) preload.push('/fonts/' + name);
  table.push([id, (statSync(src).size / 1024).toFixed(0) + ' KB', (data.length / 1024).toFixed(0) + ' KB']);
}
writeFileSync('src/styles/fonts.css', '/* made by scripts/fonts.mjs: do not edit */\n' + faces.join('\n') + '\n');
writeFileSync(join(CACHE, 'ref.css'), refs.join('\n') + '\n');
writeFileSync('src/data/fonts.json', JSON.stringify({ preload }, null, 2) + '\n');
console.table(table.map(([face, google, ours]) => ({ face, google, ours })));
const total = readdirSync(OUT).filter((f) => f.endsWith('.woff2')).reduce((a, f) => a + statSync(join(OUT, f)).size, 0);
console.log('fonts total ' + (total / 1024).toFixed(0) + ' KB; preload ' + preload.length + ' files');
