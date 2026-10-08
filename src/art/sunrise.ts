// The sunrise, drawn in code for this invitation: no one else's art. Two hills face each other across a river at dawn.
// Ranchi's is on the left, with a white temple on its top like the Pahari Mandir. Pune's flat-topped Sahyadri is on
// the right, with Parvati's temple. The sun comes up between them. Chhath diyas float on the water among lotuses,
// a flower both families hold holy.
// Every layer is one 1600 × 1000 frame, cropped from the bottom centre (xMidYMax slice): a phone sees the middle 460
// or so, a laptop all of it. The page slides the layers apart as you scroll (motion/hero.ts).
// Random numbers come from a fixed seed, so every build draws the same picture.

type P = [number, number];
const W = 1600, H = 1000;
const f = (n: number) => String(Math.round(n * 10) / 10);

export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const C = {
  far0: '#F3DCC5', far: '#EBCDB2', farLo: '#F2DCC6', rimFar: '#FFF1DF',
  mid: '#D9B898', midLo: '#E9CDB0', rimMid: '#FFE9CC',
  white: '#FFF4E6', whiteShade: '#EBD3B8', stoneLine: '#CFAE8C', flag: '#E0742E',
  treeDark: '#6C6D43', tree: '#848351', treeLit: '#A9A266', treeGold: '#CDB878',
  bank: '#767A49', bankLo: '#5C6339',
  water0: '#FFF4E2', water1: '#F7DBB8', water2: '#EBC39A',
  stone: '#EACDA8', riser: '#C8A07A',
  leaf: '#6F8A4B', leafLit: '#93AA63', lotus: '#F4A8B2', lotusDeep: '#DD7389', lotusCore: '#F7D07C',
  clay: '#A54F2A', clayLit: '#C9703F', flame: '#FFC65A', flameCore: '#FFF5CF',
  cloud: '#FFF8EE', cloudLo: '#F6D8BA', cloudShade: '#EDC4A0'
};

const svg = (body: string, defs = '', ratio = 'xMidYMax slice', vb = `0 0 ${W} ${H}`) =>
  `<svg viewBox="${vb}" preserveAspectRatio="${ratio}" aria-hidden="true" focusable="false">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
const vgrad = (id: string, stops: [number, string, number?][]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;

/* ---------- lines ---------- */

/** a smooth line through the points (Catmull-Rom, as cubic Béziers) */
function curve(pts: P[]) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
const line = (pts: P[]) => 'M' + pts.map(([x, y]) => f(x) + ' ' + f(y)).join('L');
const down = (pts: P[], d: string) => d + `L${f(pts[pts.length - 1][0])} ${H + 4}L${f(pts[0][0])} ${H + 4}Z`;

/** hills through key points, with small bumps between them so the line looks drawn, not computed */
function ridge(keys: P[], rough: number, rand: () => number, step = 34): P[] {
  const out: P[] = [];
  for (let i = 0; i < keys.length - 1; i++) {
    const [x0, y0] = keys[i], [x1, y1] = keys[i + 1], n = Math.max(1, Math.round((x1 - x0) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, e = (1 - Math.cos(Math.PI * t)) / 2;
      out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * e + (k ? (rand() - 0.5) * rough : 0)]);
    }
  }
  out.push(keys[keys.length - 1]);
  return out;
}

/** a Deccan mesa: a long talus, a ledge, the scarp, then a top as flat as a table */
function mesa(x0: number, x1: number, top: number, foot: number, rand: () => number): P[] {
  const w = x1 - x0, h = foot - top, j = () => (rand() - 0.5) * 4;
  const pts: P[] = [[x0, foot], [x0 + w * 0.1, foot - h * 0.22 + j()], [x0 + w * 0.17, foot - h * 0.42 + j()], [x0 + w * 0.205, foot - h * 0.46],
    [x0 + w * 0.225, foot - h * 0.5], [x0 + w * 0.25, top + h * 0.16 + j()], [x0 + w * 0.268, top + h * 0.03], [x0 + w * 0.29, top]];
  for (let x = x0 + w * 0.33; x < x1 - w * 0.3; x += 22) pts.push([x, top + (rand() - 0.5) * 2.4]);
  pts.push([x1 - w * 0.28, top + 1], [x1 - w * 0.262, top + h * 0.1], [x1 - w * 0.24, top + h * 0.3 + j()], [x1 - w * 0.215, foot - h * 0.5],
    [x1 - w * 0.18, foot - h * 0.47], [x1 - w * 0.11, foot - h * 0.26 + j()], [x1, foot]);
  return pts;
}

/* ---------- things in the landscape ---------- */

/** a white hilltop temple: a curved shikhara with its bands, the amalaka and kalash on top, a saffron flag */
function temple(x: number, y: number, s: number, porch = true) {
  const sh = 64 * s, bw = 22 * s, base = y;
  const tower = `M${f(x - bw)} ${f(base - 12 * s)}C${f(x - bw)} ${f(base - sh * 0.62)} ${f(x - bw * 0.42)} ${f(base - sh * 0.92)} ${f(x)} ${f(base - sh)}C${f(x + bw * 0.42)} ${f(base - sh * 0.92)} ${f(x + bw)} ${f(base - sh * 0.62)} ${f(x + bw)} ${f(base - 12 * s)}Z`;
  const half = `M${f(x)} ${f(base - sh)}C${f(x + bw * 0.42)} ${f(base - sh * 0.92)} ${f(x + bw)} ${f(base - sh * 0.62)} ${f(x + bw)} ${f(base - 12 * s)}L${f(x)} ${f(base - 12 * s)}Z`;
  let bands = '';
  for (let k = 1; k < 6; k++) {
    const yy = base - 12 * s - (sh - 12 * s) * (k / 6.2), t = (yy - (base - sh)) / (sh - 12 * s), hw = bw * Math.sqrt(Math.max(0.02, t)) * 1.02;
    bands += `M${f(x - hw)} ${f(yy)}Q${f(x)} ${f(yy + 2 * s)} ${f(x + hw)} ${f(yy)}`;
  }
  const top = base - sh;
  const flagpole = `M${f(x)} ${f(top - 7 * s)}V${f(top - 30 * s)}`;
  const flag = `M${f(x)} ${f(top - 30 * s)}l${f(15 * s)} ${f(4 * s)}l${f(-15 * s)} ${f(6 * s)}Z`;
  const porchD = porch ? `<path d="M${f(x - bw * 1.9)} ${f(base)}V${f(base - 14 * s)}Q${f(x - bw * 1.45)} ${f(base - 24 * s)} ${f(x - bw)} ${f(base - 16 * s)}V${f(base)}Z" fill="${C.white}"/><path d="M${f(x - bw * 1.62)} ${f(base)}V${f(base - 8 * s)}Q${f(x - bw * 1.45)} ${f(base - 13 * s)} ${f(x - bw * 1.28)} ${f(base - 8 * s)}V${f(base)}Z" fill="${C.whiteShade}"/>` : '';
  return `<g>${porchD}<rect x="${f(x - bw * 1.08)}" y="${f(base - 14 * s)}" width="${f(bw * 2.16)}" height="${f(14 * s)}" fill="${C.white}"/>` +
    `<path d="${tower}" fill="${C.white}"/><path d="${half}" fill="${C.whiteShade}" opacity=".75"/>` +
    `<path d="${bands}" fill="none" stroke="${C.stoneLine}" stroke-width="${f(1.1 * s)}" opacity=".7"/>` +
    `<ellipse cx="${f(x)}" cy="${f(top - 2 * s)}" rx="${f(6.5 * s)}" ry="${f(3 * s)}" fill="${C.white}"/>` +
    `<path d="M${f(x - 2.6 * s)} ${f(top - 4 * s)}Q${f(x)} ${f(top - 13 * s)} ${f(x + 2.6 * s)} ${f(top - 4 * s)}Z" fill="#E7B65A"/>` +
    `<path d="${flagpole}" stroke="${C.stoneLine}" stroke-width="${f(1.2 * s)}"/><path d="${flag}" fill="${C.flag}"/>` +
    `<rect x="${f(x - 3.5 * s)}" y="${f(base - 10 * s)}" width="${f(7 * s)}" height="${f(10 * s)}" rx="${f(3.5 * s)}" fill="#B98A62" opacity=".7"/></g>`;
}

/** a small dome on four pillars (a chhatri) */
function chhatri(x: number, y: number, s: number) {
  const w = 18 * s;
  return `<g><path d="M${f(x - w)} ${f(y - 22 * s)}Q${f(x - w)} ${f(y - 40 * s)} ${f(x)} ${f(y - 44 * s)}Q${f(x + w)} ${f(y - 40 * s)} ${f(x + w)} ${f(y - 22 * s)}Z" fill="${C.white}"/>` +
    `<path d="M${f(x)} ${f(y - 44 * s)}V${f(y - 52 * s)}" stroke="#E7B65A" stroke-width="${f(2 * s)}"/>` +
    `<rect x="${f(x - w - 3 * s)}" y="${f(y - 24 * s)}" width="${f(2 * w + 6 * s)}" height="${f(4 * s)}" fill="${C.whiteShade}"/>` +
    [-1, -0.33, 0.33, 1].map((k) => `<rect x="${f(x + k * w * 0.86 - 1.6 * s)}" y="${f(y - 20 * s)}" width="${f(3.2 * s)}" height="${f(20 * s)}" fill="${C.white}"/>`).join('') +
    `<rect x="${f(x - w - 4 * s)}" y="${f(y)}" width="${f(2 * w + 8 * s)}" height="${f(5 * s)}" fill="${C.whiteShade}"/></g>`;
}

/** a tree as an illustrator draws one: a cluster of round shapes, dark, then mid, then lit on the side facing the sun.
    Its shapes join three shared paths (one per ink), so a whole bank of trees is three elements */
type Inks = { dark: string[]; mid: string[]; lit: string[] };
const circ = (cx: number, cy: number, r: number) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`;
function tree(x: number, y: number, s: number, rand: () => number, toSun: number, ink: Inks) {
  const n = 4 + Math.floor(rand() * 3), r = 13 * s, blobs: P[] = [];
  for (let i = 0; i < n; i++) blobs.push([x + (rand() - 0.5) * r * 2.2, y - r * (0.9 + rand() * 1.5)]);
  const sx = toSun * r * 0.22;
  for (const [bx, by] of blobs) ink.dark.push(circ(bx, by, r * (0.85 + rand() * 0.3)));
  for (const [bx, by] of blobs) ink.mid.push(circ(bx + sx, by - r * 0.22, r * 0.72));
  for (const [bx, by] of blobs) if (by < y - r * 1.4) ink.lit.push(circ(bx + sx * 1.8, by - r * 0.42, r * 0.38));
}

/** a toddy palm, the tree of every Bihar riverbank */
function palm(x: number, y: number, h: number, lean: number) {
  const tx = x + lean, ty = y - h;
  const trunk = `<path d="M${f(x - 3)} ${f(y)}Q${f(x + lean * 0.3)} ${f(y - h * 0.5)} ${f(tx - 1.5)} ${f(ty)}L${f(tx + 1.5)} ${f(ty)}Q${f(x + lean * 0.3 + 4)} ${f(y - h * 0.5)} ${f(x + 3)} ${f(y)}Z" fill="${C.treeDark}"/>`;
  let fronds = '';
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI + (i / 8) * Math.PI, len = h * (0.34 + (i % 2) * 0.08);
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.55 + len * 0.22;
    fronds += `M${f(tx)} ${f(ty)}Q${f(tx + Math.cos(a) * len * 0.5)} ${f(ty + Math.sin(a) * len * 0.5 - 6)} ${f(ex)} ${f(ey)}`;
  }
  return trunk + `<path d="${fronds}" fill="none" stroke="${C.treeDark}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="${fronds}" fill="none" stroke="${C.tree}" stroke-width="2" stroke-linecap="round" transform="translate(${lean > 0 ? -1 : 1} -1.5)"/>`;
}

/** a lotus flower seen from the side, its petals open, its heart gold */
function lotus(x: number, y: number, s: number) {
  const p = (dx: number, rot: number, h: number, w: number, c: string) =>
    `<path d="M0 0C${f(-w)} ${f(-h * 0.35)} ${f(-w * 0.7)} ${f(-h * 0.85)} 0 ${f(-h)}C${f(w * 0.7)} ${f(-h * 0.85)} ${f(w)} ${f(-h * 0.35)} 0 0Z" fill="${c}" transform="translate(${f(dx)} 0) rotate(${rot})"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">` +
    p(-4, -62, 16, 6, C.lotusDeep) + p(4, 62, 16, 6, C.lotusDeep) +
    p(-3, -32, 21, 7, C.lotus) + p(3, 32, 21, 7, C.lotus) +
    `<ellipse cx="0" cy="-4" rx="7" ry="3" fill="${C.lotusCore}"/>` + p(0, 0, 24, 7, C.lotus) +
    `<path d="M0 -3C-2 -12 -1.5 -18 0 -22" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="1.2" fill="none"/></g>`;
}

/** a lotus leaf lying on the water, foreshortened, with its notch */
function pad(x: number, y: number, s: number, rot: number) {
  const rx = 26 * s, ry = 8 * s;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})"><path d="M0 0L${f(rx * 0.95)} ${f(-ry * 0.35)}A${f(rx)} ${f(ry)} 0 1 1 ${f(rx * 0.95)} ${f(ry * 0.35)}Z" fill="${C.leaf}"/>` +
    `<path d="M${f(-rx * 0.8)} ${f(-ry * 0.3)}A${f(rx * 0.9)} ${f(ry * 0.8)} 0 0 1 ${f(rx * 0.6)} ${f(-ry * 0.6)}" stroke="${C.leafLit}" stroke-width="${f(1.6 * s)}" fill="none"/></g>`;
}

/** a clay diya afloat, its flame lit, its light on the water */
function diya(x: number, y: number, s: number, id: string) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">` +
    `<ellipse cx="0" cy="6" rx="16" ry="5" fill="url(#${id}-glowW)"/>` +
    `<circle cx="0" cy="-14" r="26" fill="url(#${id}-glow)"/>` +
    `<path d="M-13 -3Q-12 6 0 7Q12 6 13 -3Q6 0 0 0Q-6 0 -13 -3Z" fill="${C.clay}"/><path d="M-13 -3Q0 2 13 -3Q0 -1 -13 -3Z" fill="${C.clayLit}"/>` +
    `<path d="M9 -3Q13 -5 15 -8" stroke="${C.clay}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    `<path d="M0 -20C-4 -13 -4.5 -8 0 -5.5C4.5 -8 4 -13 0 -20Z" fill="${C.flame}"/><path d="M0 -15C-2 -11 -2 -8.5 0 -7C2 -8.5 2 -11 0 -15Z" fill="${C.flameCore}"/></g>`;
}

/** a cumulus: puffs along a dome over a flat foot, each lit from above */
function cloud(cx: number, cy: number, w: number, rand: () => number, id: string, puffs = 9) {
  let shade = '', body = '';
  for (let i = 0; i < puffs; i++) {
    const t = i / (puffs - 1), dome = Math.sin(Math.PI * (0.08 + t * 0.84));
    const r = w * (0.06 + 0.1 * dome) * (0.85 + rand() * 0.35);
    const x = cx - w / 2 + t * w + (rand() - 0.5) * w * 0.04, y = cy - dome * w * 0.09 + (rand() - 0.5) * 6;
    shade += `<circle cx="${f(x)}" cy="${f(y + r * 0.18)}" r="${f(r)}"/>`;
    body += `<circle cx="${f(x - r * 0.06)}" cy="${f(y - r * 0.04)}" r="${f(r * 0.94)}"/>`;
  }
  const foot = `<rect x="${f(cx - w * 0.47)}" y="${f(cy - w * 0.04)}" width="${f(w * 0.94)}" height="${f(w * 0.08)}" rx="${f(w * 0.04)}"/>`;
  return `<g fill="${C.cloudShade}">${shade}${foot}</g><g fill="url(#${id})">${body}</g>`;
}

/* ---------- the layers ---------- */

/** a whole SVG file, for a layer the page loads as an image: its ids stay inside it */
const doc = (body: string, defs = '', vb = `0 0 ${W} ${H}`, ratio = 'xMidYMax slice') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="${ratio}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;

/** the diyas on the morning river (x, y, size); the page lights a flickering glow over each flame */
export const DIYAS: [number, number, number][] = [[742, 872, 0.62], [800, 846, 0.5], [866, 900, 0.7], [776, 962, 0.95], [930, 838, 0.46], [688, 920, 0.78], [902, 978, 1]];
/** and on the night river, many more */
export const NIGHT_DIYAS: [number, number, number][] = [[600, 952, 0.9], [652, 884, 0.62], [706, 836, 0.48], [748, 912, 0.75], [790, 800, 0.38], [812, 862, 0.56],
  [860, 944, 0.92], [884, 826, 0.44], [930, 880, 0.64], [978, 958, 0.86], [1012, 842, 0.5], [548, 860, 0.58], [1060, 900, 0.7], [470, 930, 0.8], [1140, 960, 0.9], [1218, 872, 0.6], [392, 980, 1]];

/** the hills, the same at dawn and at night */
function shapes() {
  const rand = rng(1209);
  return {
    back: ridge([[-60, 650], [220, 628], [520, 640], [800, 652], [1080, 626], [1380, 640], [1660, 630]], 5, rand),
    ranchi: ridge([[-60, 636], [80, 598], [210, 586], [330, 610], [440, 588], [545, 556], [640, 574], [730, 604], [820, 640], [900, 660]], 7, rand),
    pune0: mesa(1300, 1640, 506, 600, rand), pune1: mesa(830, 1250, 528, 668, rand), pune2: mesa(1150, 1700, 552, 672, rand),
    left: ridge([[-60, 702], [140, 690], [300, 672], [440, 642], [560, 604], [640, 582], [690, 584], [750, 612], [820, 672], [880, 728]], 6, rand, 28),
    right: ridge([[720, 732], [800, 694], [870, 646], [930, 606], [975, 592], [1030, 593], [1085, 612], [1170, 650], [1310, 680], [1480, 694], [1660, 700]], 6, rand, 28),
    lEdge: [[772, 716], [720, 744], [640, 784], [540, 834], [420, 892], [260, 960], [150, 1004]] as P[],
    rEdge: [[828, 716], [884, 742], [968, 780], [1080, 826], [1220, 884], [1380, 950], [1500, 1004]] as P[],
    lTop: ridge([[-60, 706], [300, 712], [600, 714], [772, 716]], 3, rand, 40),
    rTop: ridge([[828, 716], [1100, 714], [1400, 710], [1660, 706]], 3, rand, 40)
  };
}
type Shapes = ReturnType<typeof shapes>;
const banks = (S: Shapes) => ({
  left: curve(S.lTop) + S.lEdge.slice(1).map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + 'L-60 1004Z',
  right: 'M' + f(S.rEdge[0][0]) + ' ' + f(S.rEdge[0][1]) + curve(S.rTop).replace(/^M[^C]+/, '') + `L1660 1004L${f(S.rEdge[S.rEdge.length - 1][0])} 1004` +
    [...S.rEdge].reverse().slice(1).map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + 'Z',
  river: `M${f(S.lEdge[0][0])} ${f(S.lEdge[0][1])}` + S.lEdge.slice(1).map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + [...S.rEdge].reverse().map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + 'Z'
});
/** trees along both banks, smaller towards the middle where the bank is far away */
function treeline(rand: () => number) {
  const ink: Inks = { dark: [], mid: [], lit: [] };
  const row = (x0: number, x1: number) => {
    for (let x = x0; x < x1; x += 15 + rand() * 12) {
      const d = Math.abs(x - 800) / 800, s = 0.45 + d * 1.15;
      tree(x, 715 + d * 2, s * (0.85 + rand() * 0.3), rand, x < 800 ? 1 : -1, ink);
    }
  };
  row(-40, 760);
  row(842, 1650);
  return ink;
}

/**
 * The morning scene, as four layers that slide apart as you scroll: the sky (saved as a picture), the far hills,
 * the temple hills and the river (SVG files). The sun's disc, a few drifting clouds, the birds and the diyas' glow
 * are small pieces the page places over them, at the points in DIYAS and MARKS.
 */
export function scene() {
  const S = shapes(), rand = rng(20261209);

  /* sky: the gradient, the sun's wide glow, streaks of cloud, banks in the laptop's corners, the faintest range */
  let streaks = '';
  for (let i = 0; i < 9; i++) {
    const y = 380 + rand() * 190, x = 120 + rand() * 1360, rx = 120 + rand() * 260;
    streaks += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(4 + rand() * 6)}" fill="#FFF7EC" opacity="${f(0.35 + rand() * 0.35)}"/>`;
  }
  const sky = doc(
    `<rect x="-20" y="-20" width="1640" height="1040" fill="url(#k)"/><circle cx="800" cy="600" r="640" fill="url(#h)"/><circle cx="800" cy="600" r="230" fill="url(#h2)"/>` +
    streaks + cloud(190, 250, 420, rand, 'c', 11) + cloud(1420, 190, 460, rand, 'c', 11) + cloud(1180, 330, 200, rand, 'c', 7) +
    `<path d="${down(S.back, curve(S.back))}" fill="${C.far0}"/>`,
    vgrad('k', [[0, '#E8BC9A'], [0.34, '#F4D3B2'], [0.56, '#FBE4C8'], [0.66, '#FFF0DC'], [1, '#FFF4E4']]) +
    `<radialGradient id="h"><stop offset="0" stop-color="#FFE9C2" stop-opacity=".95"/><stop offset=".35" stop-color="#FFDDB0" stop-opacity=".5"/><stop offset="1" stop-color="#FFD6A8" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="h2"><stop offset="0" stop-color="#FFF7E6" stop-opacity=".9"/><stop offset="1" stop-color="#FFEBC8" stop-opacity="0"/></radialGradient>` +
    vgrad('c', [[0, C.cloud], [0.7, '#FFF0DE'], [1, C.cloudLo]])
  );

  /* far: Ranchi's rounded plateau hills on the left, the Sahyadri's mesas on the right */
  const rim = (d: string, c: string) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.2"/>`;
  const far = doc(
    `<path d="${down(S.pune0, line(S.pune0))}" fill="${C.far0}"/>` +
    `<path d="${down(S.pune1, line(S.pune1))}" fill="url(#g)"/>` + rim(line(S.pune1), C.rimFar) +
    `<path d="${down(S.pune2, line(S.pune2))}" fill="url(#g)"/>` + rim(line(S.pune2), C.rimFar) +
    `<path d="${down(S.ranchi, curve(S.ranchi))}" fill="url(#g)"/>` + rim(curve(S.ranchi), C.rimFar),
    vgrad('g', [[0, C.far], [0.2, C.farLo]])
  );

  /* mid: the two temple hills, Parvati's steps climbing the right one */
  const steps = `<path d="M1150 652L1110 636L1128 626L1090 614L1104 604L1060 598" fill="none" stroke="${C.rimMid}" stroke-width="2.4" stroke-dasharray="3 3" opacity=".9"/>`;
  const mid = doc(
    `<path d="${down(S.right, curve(S.right))}" fill="url(#g)"/>` + rim(curve(S.right), C.rimMid) + steps +
    `<path d="${down(S.left, curve(S.left))}" fill="url(#g)"/>` + rim(curve(S.left), C.rimMid) +
    temple(664, 586, 0.86) + temple(1004, 596, 0.74, false) + chhatri(964, 598, 0.42) + chhatri(1044, 598, 0.42),
    vgrad('g', [[0, C.mid], [0.14, C.midLo]])
  );

  /* near: mist, the river and the sun's path on it, the banks and their trees, the ghat, lotuses, diyas */
  const B = banks(S);
  const glit: string[][] = [[], [], []];
  for (let y = 722; y < 1000; y += 9 + (y - 716) * 0.03) {
    const t = (y - 716) / 284, n = 1 + Math.floor(t * 3);
    for (let k = 0; k < n; k++) {
      const w = 10 + t * 70 * (0.5 + rand()), x = 800 + (rand() - 0.5) * (12 + t * 160), h = 1.6 + t * 2.4;
      glit[Math.min(2, Math.floor(t * 3))].push(`M${f(x - w / 2)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`);
    }
  }
  const ripples: string[] = [];
  for (let i = 0; i < 26; i++) {
    const y = 730 + rand() * 260, t = (y - 716) / 284, cx = 800 + (rand() - 0.5) * (120 + t * 900), w = 20 + t * 90 * rand();
    ripples.push(`M${f(cx - w / 2)} ${f(y)}h${f(w)}`);
  }
  /* grass along the water's edge */
  const tufts: string[] = [];
  for (const edge of [S.lEdge, S.rEdge]) for (let i = 0; i < edge.length - 1; i++) {
    const [x0, y0] = edge[i], [x1, y1] = edge[i + 1];
    for (let t = 0.1; t < 1; t += 0.22) {
      const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, h = 4 + ((y - 716) / 284) * 14, side = edge === S.lEdge ? -1 : 1;
      for (let k = -1; k <= 1; k++) tufts.push(`M${f(x + side * 6 + k * h * 0.3)} ${f(y + 2)}q${f(k * h * 0.2)} ${f(-h * 0.5)} ${f(k * h * 0.45)} ${f(-h)}`);
    }
  }
  /* the banks are fields: furrows running towards the far end of the river, and a few bushes */
  let furrows = '';
  for (let k = -16; k <= 16; k++) if (Math.abs(k) > 2) furrows += `M800 716L${f(800 + k * 110)} 1004`;
  const bushes: string[] = [];
  for (let i = 0; i < 40; i++) {
    const side = i % 2 ? 1 : -1, t = 0.15 + rand() * 0.85, y = 720 + t * 280, x = 800 + side * (90 + t * 700 + rand() * 260 * t), r = 3 + t * 9;
    bushes.push(circ(x, y, r), circ(x + r, y + r * 0.2, r * 0.8));
  }
  const ink = treeline(rand);
  const palms = palm(118, 712, 150, 14) + palm(176, 714, 118, -8) + palm(1488, 712, 136, -12) + palm(612, 714, 70, 6);
  let ghat = '';
  for (let k = 0; k < 6; k++) {
    const o = k * 9, a: P = [560 - o * 1.9, 830 + o * 0.6], b: P = [372 - o * 1.9, 914 + o * 0.6];
    ghat += `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}L${f(b[0] - 14)} ${f(b[1] - 2)}L${f(a[0] - 14)} ${f(a[1] - 2)}Z" fill="${C.stone}"/>` +
      `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}l0 3.5L${f(a[0])} ${f(a[1] + 3.5)}Z" fill="${C.riser}"/>`;
  }
  ghat = `<g transform="translate(-8 -14)">${ghat}</g>` + chhatri(472, 830, 0.95);
  const lotuses = [[590, 948, 1.05], [626, 972, 0.8], [1010, 960, 1.1], [1052, 944, 0.75], [248, 984, 1.3], [1330, 934, 1.15], [1380, 968, 0.9], [690, 820, 0.55]];
  const pads = lotuses.map(([x, y, s], i) => pad(x - 20 * s, y + 6 * s, s, i % 2 ? 6 : -5) + pad(x + 22 * s, y + 9 * s, s * 0.85, i % 2 ? -4 : 8) + pad(x + 4 * s, y + 16 * s, s * 0.7, 2)).join('');
  const flowers = lotuses.map(([x, y, s]) => lotus(x, y + 4 * s, s)).join('');
  const near = doc(
    `<rect x="-20" y="600" width="1640" height="150" fill="url(#m)"/><path d="${B.river}" fill="url(#w)"/>` +
    `<path d="M772 716L828 716L850 728Q800 733 750 728Z" fill="${C.treeDark}" opacity=".25"/>` +
    `<path d="${ripples.join('')}" stroke="${C.water2}" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>` +
    glit.map((g, i) => `<path d="${g.join('')}" fill="#FFFBF0" opacity="${[0.85, 0.6, 0.42][i]}"/>`).join('') +
    `<path d="${B.left}" fill="url(#b)"/><path d="${B.right}" fill="url(#b)"/>` +
    `<path d="${line(S.lEdge)}${line(S.rEdge)}" fill="none" stroke="#FFF3E0" stroke-width="2" opacity=".7"/>` +
    `<path d="${tufts.join('')}" fill="none" stroke="${C.treeLit}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<g clip-path="url(#bk)"><path d="${furrows}" stroke="#8E9259" stroke-width="2" opacity=".55"/><path d="${bushes.join('')}" fill="${C.treeDark}" opacity=".55"/></g>` +
    `<path d="${ink.dark.join('')}" fill="${C.treeDark}"/><path d="${ink.mid.join('')}" fill="${C.tree}"/><path d="${ink.lit.join('')}" fill="${C.treeLit}"/>` +
    palms + ghat + pads + flowers + DIYAS.map(([x, y, s]) => diya(x, y, s, 'd')).join(''),
    vgrad('m', [[0, '#FFF6EA', 0], [0.62, '#FFF6EA', 0.7], [1, '#FFF6EA', 0]]) +
    vgrad('w', [[0, C.water0], [0.45, C.water1], [1, C.water2]]) +
    vgrad('b', [[0, C.bank], [1, C.bankLo]]) +
    `<clipPath id="bk"><path d="${B.left}"/><path d="${B.right}"/></clipPath>` +
    `<radialGradient id="d-glow"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".85"/><stop offset="1" stop-color="#FFD480" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="d-glowW"><stop offset="0" stop-color="#FFF0C8" stop-opacity=".8"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient>`
  );

  return { sky, far, mid, near };
}

/** the same river at night, for the last section: moon, stars, every diya lit */
export function nightScene() {
  const S = shapes(), rand = rng(912), B = banks(S);
  const stars: string[] = [], bright: string[] = [];
  for (let i = 0; i < 90; i++) {
    const x = rand() * 1600, y = rand() * 520, r = 0.8 + rand() * 1.4;
    (rand() < 0.15 ? bright : stars).push(circ(x, y, r));
  }
  const ink = treeline(rng(20261209 + 1));
  const moonGlit: string[] = [];
  for (let y = 724; y < 1000; y += 10 + (y - 716) * 0.04) {
    const t = (y - 716) / 284, w = 8 + t * 60 * (0.4 + rand()), x = 1150 + (rand() - 0.5) * (10 + t * 120);
    moonGlit.push(`M${f(x - w / 2)} ${f(y)}h${f(w)}v${f(1.4 + t * 2)}h${f(-w)}Z`);
  }
  /* a temple at night: its silhouette, one lamp in the door */
  const shrine = (x: number, y: number, s: number) => {
    const sh = 64 * s, bw = 22 * s;
    return `<path d="M${f(x - bw * 1.08)} ${f(y)}V${f(y - 14 * s)}H${f(x - bw)}C${f(x - bw)} ${f(y - sh * 0.62)} ${f(x - bw * 0.42)} ${f(y - sh * 0.92)} ${f(x)} ${f(y - sh)}C${f(x + bw * 0.42)} ${f(y - sh * 0.92)} ${f(x + bw)} ${f(y - sh * 0.62)} ${f(x + bw)} ${f(y - 14 * s)}H${f(x + bw * 1.08)}V${f(y)}Z" fill="#2A1B30"/>` +
      `<path d="M${f(x)} ${f(y - sh - 6 * s)}V${f(y - sh - 28 * s)}" stroke="#2A1B30" stroke-width="${f(1.4 * s)}"/>` +
      `<circle cx="${f(x)}" cy="${f(y - 6 * s)}" r="${f(16 * s)}" fill="url(#lg)"/><rect x="${f(x - 3 * s)}" y="${f(y - 10 * s)}" width="${f(6 * s)}" height="${f(10 * s)}" rx="${f(3 * s)}" fill="#FFC86A"/>`;
  };
  return doc(
    `<rect x="-20" y="-20" width="1640" height="1040" fill="url(#k)"/>` +
    `<path d="${stars.join('')}" fill="#F6E7CF" opacity=".7"/><path d="${bright.join('')}" fill="#FFF6E2"/>` +
    `<circle cx="1150" cy="250" r="190" fill="url(#mh)"/><circle cx="1150" cy="250" r="40" fill="#FFF3D6"/><circle cx="1138" cy="242" r="40" fill="#F2DDB8" opacity=".35"/>` +
    `<path d="${down(S.back, curve(S.back))}" fill="#3F2846"/>` +
    `<path d="${down(S.pune0, line(S.pune0))}" fill="#3A2442"/><path d="${down(S.pune1, line(S.pune1))}" fill="#33203C"/><path d="${down(S.pune2, line(S.pune2))}" fill="#33203C"/>` +
    `<path d="${down(S.ranchi, curve(S.ranchi))}" fill="#33203C"/>` +
    `<path d="${down(S.right, curve(S.right))}" fill="#2A1B30"/><path d="${down(S.left, curve(S.left))}" fill="#2A1B30"/>` +
    shrine(664, 586, 0.86) + shrine(1004, 596, 0.74) +
    `<path d="${B.river}" fill="url(#w)"/><path d="${moonGlit.join('')}" fill="#FFF0D0" opacity=".55"/>` +
    `<path d="${B.left}" fill="#1E1524"/><path d="${B.right}" fill="#1E1524"/>` +
    `<path d="${ink.dark.join('')}${ink.mid.join('')}" fill="#211727"/>` +
    NIGHT_DIYAS.map(([x, y, s]) => `<ellipse cx="${f(x)}" cy="${f(y + 10 * s)}" rx="${f(14 * s)}" ry="${f(40 * s)}" fill="url(#rf)"/>` + diya(x, y, s, 'n')).join(''),
    vgrad('k', [[0, '#120C1A'], [0.4, '#22152F'], [0.6, '#3A2140'], [0.7, '#5B2E40'], [1, '#1A1220']]) +
    vgrad('w', [[0, '#5A2E40'], [0.3, '#2E1E36'], [1, '#160F1C']]) +
    `<radialGradient id="mh"><stop offset="0" stop-color="#FFF0D0" stop-opacity=".35"/><stop offset="1" stop-color="#FFF0D0" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="lg"><stop offset="0" stop-color="#FFC86A" stop-opacity=".8"/><stop offset="1" stop-color="#FFC86A" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="rf"><stop offset="0" stop-color="#FFC66A" stop-opacity=".45"/><stop offset="1" stop-color="#FFC66A" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="n-glow"><stop offset="0" stop-color="#FFD27A" stop-opacity=".9"/><stop offset="1" stop-color="#FFB850" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="n-glowW"><stop offset="0" stop-color="#FFD890" stop-opacity=".7"/><stop offset="1" stop-color="#FFC060" stop-opacity="0"/></radialGradient>`
  );
}

/** a small cloud that drifts across the sky on its own (inline; its gradient is in sprite()) */
export function puff(seed: number, w = 200) {
  const rand = rng(seed);
  return `<svg viewBox="${f(-w * 0.55)} ${f(-w * 0.34)} ${f(w * 1.1)} ${f(w * 0.48)}" aria-hidden="true" focusable="false">${cloud(0, 0, w, rand, 'sr-cl', 7)}</svg>`;
}

/** a flock: a few birds, each a "v" that the page flaps */
export function flock(n: number, seed: number) {
  const rand = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = 12 + i * 22 + rand() * 8, y = 14 + (i % 2) * 8 + rand() * 8, k = 0.7 + rand() * 0.4;
    s += `<g class="bd" style="--d:${f(-rand() * 0.6)}s"><path d="M${f(x - 9 * k)} ${f(y - 3 * k)}Q${f(x - 4 * k)} ${f(y - 6 * k)} ${f(x)} ${f(y)}Q${f(x + 4 * k)} ${f(y - 6 * k)} ${f(x + 9 * k)} ${f(y - 3 * k)}"/></g>`;
  }
  return `<svg viewBox="0 0 ${12 + n * 22 + 12} 40" aria-hidden="true" focusable="false"><g fill="none" stroke="#7E4C30" stroke-width="1.8" stroke-linecap="round">${s}</g></svg>`;
}

/* ---------- the cover's clouds: two banks that part when the invitation opens ---------- */

export function coverClouds(side: 'l' | 'r') {
  const rand = rng(side === 'l' ? 7 : 11);
  /* drawn as the left bank; the right one is its mirror. Rows of cumulus, each lit from above, piled over a solid
     ground; near x = 800 the rows billow, and they open into a V at the top so the sunrise glows through */
  const edge = (y: number) => 760 - Math.max(0, 360 - y) * 0.7;
  let rows = '';
  /* big billows down the seam and round the V, a beat apart */
  for (let y = 1080; y > -120; y -= 96 + rand() * 40) {
    const w = 320 + rand() * 220;
    rows += cloud(edge(y) - w * 0.32 + (rand() - 0.5) * 40, y, w, rand, 'cc-' + side, 9);
  }
  /* a few softer ones further in, so the bank has depth without repeating itself */
  for (let i = 0; i < 6; i++) {
    const y = 80 + i * 170 + rand() * 60, w = 260 + rand() * 260;
    rows += `<g opacity=".55">${cloud(edge(y) - 330 - rand() * 260, y, w, rand, 'cc-' + side, 8)}</g>`;
  }
  const ground = `<path d="M-20 -20H${f(edge(-20) - 120)}L${f(edge(360) - 90)} 360V1020H-20Z" fill="url(#cg-${side})"/>`;
  const defs = vgrad('cc-' + side, [[0, '#FFF9F0'], [0.6, '#FCEBD6'], [1, '#F4D3B2']]) + vgrad('cg-' + side, [[0, '#FBE6CE'], [1, '#F2D0AE']]);
  const g = ground + rows;
  return svg(side === 'l' ? g : `<g transform="translate(800 0) scale(-1 1)">${g}</g>`, defs, side === 'l' ? 'xMaxYMid slice' : 'xMinYMid slice', '0 0 800 1000');
}

/* ---------- ornaments: a sprite of shared shapes, the garland, arches, dividers, icons ---------- */

/** symbols the page reuses with <use>: marigolds, a mango leaf, a brass bell */
export function sprite() {
  const bumps = (r: number, n: number, d: number) => {
    let p = '';
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, b = ((i + 0.5) / n) * Math.PI * 2;
      p += (i ? 'Q' : 'M') + (i ? `${f(Math.cos(b - Math.PI / n) * (r + d))} ${f(Math.sin(b - Math.PI / n) * (r + d))} ` : '') + `${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`;
    }
    return p + 'Z';
  };
  const marigold = (id: string, c1: string, c2: string, c3: string) =>
    `<symbol id="${id}" viewBox="-10 -10 20 20"><path d="${bumps(7.6, 12, 2.2)}" fill="${c2}"/><path d="${bumps(5.4, 10, 1.6)}" fill="${c1}"/><circle r="2.6" fill="${c3}"/><circle cx="-1.8" cy="-2.2" r="1.1" fill="#FFFFFF" opacity=".35"/></symbol>`;
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>` +
    marigold('mg-o', '#F59A22', '#E57A12', '#C2570C') + marigold('mg-y', '#FFC531', '#F2A516', '#D9820B') +
    vgrad('sr-cl', [[0, C.cloud], [0.7, '#FFF0DE'], [1, C.cloudLo]]) +
    `<symbol id="mango" viewBox="0 0 12 34"><path d="M6 0C11 8 11 22 6 34C1 22 1 8 6 0Z" fill="#5E8A3A"/><path d="M6 2V32" stroke="#86B055" stroke-width="1"/></symbol>` +
    `<symbol id="bell" viewBox="0 0 30 44"><path d="M15 0V8" stroke="#B37E2E" stroke-width="2"/><path d="M15 7C8 7 5 13 5 21V30L2 35H28L25 30V21C25 13 22 7 15 7Z" fill="#D9A441"/><path d="M15 7C20 7 23 13 23 21V30L26 35H15Z" fill="#B98326"/><path d="M5 30H25" stroke="#F3D58A" stroke-width="1.4"/><circle cx="15" cy="39" r="3.6" fill="#9C6A1E"/><path d="M8 18C8 13 10 10 13 9" stroke="#F8E3A8" stroke-width="1.6" fill="none" stroke-linecap="round"/></symbol>` +
    `</defs></svg>`;
}

/** one swag of the marigold toran: flowers along a curve between two hanging strands */
export function swag() {
  let s = '';
  for (let i = 0; i <= 16; i++) {
    const t = i / 16, x = 4 + t * 192, y = 8 + Math.sin(Math.PI * t) * 34;
    s += `<use href="#${i % 2 ? 'mg-y' : 'mg-o'}" x="${f(x - 7.5)}" y="${f(y - 7.5)}" width="15" height="15"/>`;
  }
  return svg(s, '', 'xMidYMin meet', '0 0 200 60');
}

/** a hanging strand of marigolds, mango leaves at the top and a small bell at the end */
export function strand(n: number) {
  let s = `<use href="#mango" x="6" y="-4" width="10" height="28" transform="rotate(28 11 4)"/><use href="#mango" x="24" y="-4" width="10" height="28" transform="rotate(-28 29 4)"/>`;
  for (let i = 0; i < n; i++) s += `<use href="#${i % 2 ? 'mg-o' : 'mg-y'}" x="11" y="${f(6 + i * 12.5)}" width="18" height="18"/>`;
  s += `<use href="#bell" x="12" y="${f(8 + n * 12.5)}" width="16" height="24"/>`;
  return svg(s, '', 'xMidYMin meet', `0 0 40 ${f(34 + n * 12.5)}`);
}

/** the top of a jharokha arch, an ogee coming to a point, with a gold double line; the card's sides continue it */
export function archTop(finial = true) {
  const outer = 'M0 200V128C0 70 68 46 138 36C174 31 194 14 200 0C206 14 226 31 262 36C332 46 400 70 400 128V200';
  const inner = 'M12 200V131C12 79 76 57 141 47C175 42 193 28 200 15C207 28 225 42 259 47C324 57 388 79 388 131V200';
  return `<svg class="arch-top" viewBox="0 -24 400 224" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">` +
    `<path d="${outer}Z" fill="var(--card)"/><path d="${outer}" fill="none" stroke="var(--gold)" stroke-width="1.6" vector-effect="non-scaling-stroke"/>` +
    `<path d="${inner}" fill="none" stroke="var(--gold)" stroke-width="1" vector-effect="non-scaling-stroke" opacity=".8"/>` +
    (finial ? `<path d="M200 -22C196 -14 193 -9 193 -5C193 -1 196 1 200 1C204 1 207 -1 207 -5C207 -9 204 -14 200 -22Z" fill="var(--gold)"/>` : '') +
    `</svg>`;
}

/** a gold rule with the sun coming up at its centre */
export function divider() {
  let rays = '';
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI + (i / 12) * Math.PI, r0 = 14, r1 = i % 2 ? 26 : 34;
    rays += `M${f(60 + Math.cos(a) * r0)} ${f(40 + Math.sin(a) * r0)}L${f(60 + Math.cos(a) * r1)} ${f(40 + Math.sin(a) * r1)}`;
  }
  return `<svg class="divider" viewBox="0 0 120 48" width="120" height="48" aria-hidden="true" focusable="false">` +
    `<path d="M0 40H40M80 40H120" stroke="currentColor" stroke-width="1"/><path d="M36 40l4 -3 4 3 -4 3Z M76 40l4 -3 4 3 -4 3Z" fill="currentColor"/>` +
    `<path d="M48 40A12 12 0 0 1 72 40Z" fill="currentColor"/><path d="${rays}" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;
}

/** a lotus in gold line, for the invocations: both families' flower */
export function lotusMark() {
  return `<svg class="lotus-mark" viewBox="0 0 96 60" width="96" height="60" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">` +
    `<path d="M48 8C40 18 38 32 48 46C58 32 56 18 48 8Z"/><path d="M48 46C36 40 28 28 30 16C38 20 44 30 48 46Z"/><path d="M48 46C60 40 68 28 66 16C58 20 52 30 48 46Z"/>` +
    `<path d="M48 46C34 46 20 38 14 28C26 26 38 34 48 46Z"/><path d="M48 46C62 46 76 38 82 28C70 26 58 34 48 46Z"/>` +
    `<path d="M20 52H76M30 57H66" stroke-linecap="round"/></g><circle cx="48" cy="2.5" r="2" fill="currentColor"/></svg>`;
}

/** line icons, drawn on a 48 grid in the ink colour */
export const icons: Record<string, string> = {
  /* turmeric in a bowl, with two mango leaves */
  haldi: '<path d="M8 26h32c0 9-7 15-16 15S8 35 8 26Z"/><path d="M12 26c2-4 6-6 12-6s10 2 12 6"/><path d="M20 20c-6-4-8-10-6-14 5 1 8 6 6 14Z"/><path d="M28 20c6-4 8-10 6-14-5 1-8 6-6 14Z"/><path d="M16 45h16"/>',
  /* a dholak */
  sangeet: '<path d="M10 16c0-3 6-5 14-5s14 2 14 5v16c0 3-6 5-14 5s-14-2-14-5Z"/><path d="M10 16c0 3 6 5 14 5s14-2 14-5"/><path d="M15 20.5 19 35M24 21v16M33 20.5 29 35"/><path d="M6 6l8 6M42 6l-8 6"/>',
  /* the sacred fire in its kund */
  shaadi: '<path d="M10 34h28l-4 8H14Z"/><path d="M24 30c-7-3-8-10-3-16 0 4 2 6 4 7 0-6 3-10 7-13-1 5 1 8 2 11 2 5-2 10-10 11Z"/><path d="M6 34h36"/>',
  /* sun behind a cloud */
  weather: '<circle cx="18" cy="17" r="7"/><path d="M18 4v3M7 8l2 2M4 18h3M29 8l-2 2"/><path d="M16 38h20a7 7 0 0 0 0-14 9 9 0 0 0-17 3 6 6 0 0 0-3 11Z"/>',
  /* a draped dupatta on a hanger */
  dress: '<path d="M24 9a3 3 0 1 1 3 3c-2 0-3 1-3 3v1"/><path d="M24 16 7 26h34Z"/><path d="M12 26c0 8 4 14 12 16 8-2 12-8 12-16"/><path d="M18 30c2 4 4 6 6 7"/>',
  /* a map pin */
  map: '<path d="M24 43s13-12 13-23a13 13 0 0 0-26 0c0 11 13 23 13 23Z"/><circle cx="24" cy="20" r="5"/>',
  /* a letter with a seal */
  letter: '<rect x="6" y="12" width="36" height="25" rx="2"/><path d="m6 14 18 13 18-13"/><circle cx="24" cy="31" r="4"/>'
};
export const icon = (name: string, size = 36) =>
  `<svg class="ic-line" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</g></svg>`;

/* ---------- the middle of the day: medallions, frames, the venue map, the photo frames' motifs ---------- */

const ring = (r: number) => `<circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--gold)" stroke-width="1.4"/><circle cx="60" cy="60" r="${r - 5}" fill="none" stroke="var(--gold)" stroke-width=".8" opacity=".7"/>`;

/** his Bihar: the sun rising over the river, a soop of fruit raised to it, as at Chhath */
export function medalChhath() {
  return `<svg class="hm-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle cx="60" cy="60" r="56" fill="#FCE7C8"/>` +
    `<clipPath id="mc-clip"><circle cx="60" cy="60" r="51"/></clipPath><g clip-path="url(#mc-clip)">` +
    `<rect x="0" y="0" width="120" height="70" fill="#F8D9AE"/><circle cx="60" cy="66" r="20" fill="#F6A94B"/><circle cx="60" cy="66" r="14" fill="#FBC46C"/>` +
    `<rect x="0" y="66" width="120" height="60" fill="#E9B98C"/><path d="M30 76h60M38 84h44M46 92h28" stroke="#FFF1DA" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M34 100Q60 80 86 100L80 108Q60 96 40 108Z" fill="#B87A3A"/><path d="M38 100Q60 84 82 100" stroke="#D9A160" stroke-width="1.4" fill="none"/>` +
    `<circle cx="52" cy="92" r="4" fill="#E0742E"/><circle cx="60" cy="90" r="4.4" fill="#F2B43C"/><circle cx="68" cy="92" r="4" fill="#9DB04A"/></g>` + ring(56) + `</svg>`;
}

/** her faith: a Bodhi leaf, its long drip tip and its veins */
export function medalBodhi() {
  let veins = '';
  for (let i = 1; i <= 6; i++) {
    const y = 34 + i * 9, w = 6 + Math.sin((i / 7) * Math.PI) * 16;
    veins += `M60 ${y + 6}Q${60 - w * 0.6} ${y + 2} ${60 - w} ${y - 4}M60 ${y + 6}Q${60 + w * 0.6} ${y + 2} ${60 + w} ${y - 4}`;
  }
  return `<svg class="hm-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle cx="60" cy="60" r="56" fill="#EEF1DC"/>` +
    `<path d="M60 26C40 26 26 42 30 60C34 76 48 86 58 98C59 102 59.5 106 60 112C60.5 106 61 102 62 98C72 86 86 76 90 60C94 42 80 26 60 26Z" fill="#7FA24E"/>` +
    `<path d="M60 26C80 26 94 42 90 60C86 76 72 86 62 98C61 102 60.5 106 60 112Z" fill="#6A8F3E"/>` +
    `<path d="M60 30V100" stroke="#C9DB97" stroke-width="1.4"/><path d="${veins}" stroke="#B9CF83" stroke-width="1" fill="none"/>` + ring(56) + `</svg>`;
}

/** the gold thread between the two medallions, drawn as you scroll */
export function thread() {
  return `<svg class="hm-thread" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">` +
    `<path d="M2 30C50 2 70 58 100 30S150 2 198 30" fill="none" stroke="var(--gold)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}

/** a lotus-petal medallion, the frame round the couple's note: sixteen petals on a gold ring */
export function petalFrame() {
  let petals = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2, x = 200 + Math.cos(a) * 176, y = 200 + Math.sin(a) * 176, deg = (a * 180) / Math.PI + 90;
    petals += `<path d="M0 10C-12 0 -10 -16 0 -24C10 -16 12 0 0 10Z" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg)})"/>`;
  }
  return `<svg class="nt-frame" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g fill="none" stroke="var(--gold)" stroke-width="1.2">` +
    `<circle cx="200" cy="200" r="168"/><circle cx="200" cy="200" r="160" opacity=".6"/>${petals}</g></svg>`;
}

/** the venue on a little drawn map: a river, two roads, a park, the pin */
export function mapCard() {
  return `<svg class="vn-drawn" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">` +
    `<rect width="320" height="200" fill="#F6EAD3"/><path d="M0 150C60 130 90 170 160 150S270 110 320 130V200H0Z" fill="#CFE0D8"/>` +
    `<path d="M-10 60L330 92M120 -10L150 210M230 -10L250 210" stroke="#FFFFFF" stroke-width="9"/><path d="M-10 60L330 92M120 -10L150 210M230 -10L250 210" stroke="#E7D3B0" stroke-width="1"/>` +
    `<rect x="170" y="20" width="44" height="34" rx="6" fill="#DCE7C4"/><circle cx="192" cy="37" r="9" fill="#C8DAA9"/>` +
    `<g transform="translate(176 104)"><ellipse cx="0" cy="24" rx="10" ry="3.5" fill="#5F250F" opacity=".2"/>` +
    `<path d="M0 22C-12 8 -14 0 -14 -6A14 14 0 0 1 14 -6C14 0 12 8 0 22Z" fill="#AB5626"/><circle cx="0" cy="-6" r="5.5" fill="#FFF9F0"/></g></svg>`;
}

/** what a photo frame shows until the couple's photos arrive */
export function motif(i: number) {
  const bg = ['#F8E1C4', '#F3D9D6', '#E6EBD0', '#F6E6C0', '#EBDDEA', '#F9E4CF'][i % 6];
  const draw = [
    lotus(60, 92, 2.2),
    diya(60, 86, 2.1, 'm' + i),
    `<use href="#mg-o" x="22" y="34" width="44" height="44"/><use href="#mg-y" x="54" y="42" width="40" height="40"/><use href="#mg-o" x="36" y="64" width="34" height="34"/>`,
    `<use href="#bell" x="38" y="22" width="44" height="66"/>`,
    `<circle cx="60" cy="70" r="26" fill="#F6B05A"/><path d="M18 92h84M28 100h64" stroke="#E9B98C" stroke-width="4" stroke-linecap="round"/>`,
    `<path d="M60 26C40 26 30 44 34 60C38 74 50 84 58 94C59 98 60 102 60 106C60 102 61 98 62 94C70 84 82 74 86 60C90 44 80 26 60 26Z" fill="#7FA24E"/>`
  ][i % 6];
  const defs = i % 6 === 1 ? `<defs><radialGradient id="m${i}-glow"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".85"/><stop offset="1" stop-color="#FFD480" stop-opacity="0"/></radialGradient><radialGradient id="m${i}-glowW"><stop offset="0" stop-color="#FFF0C8" stop-opacity=".8"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient></defs>` : '';
  return `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${defs}<rect width="120" height="120" fill="${bg}"/>${draw}</svg>`;
}

/** the marigold string the photos hang from: flowers along a gentle curve */
export function garland(w = 600) {
  let s = '';
  for (let i = 0; i <= 30; i++) {
    const t = i / 30, x = 6 + t * (w - 12), y = 10 + Math.sin(Math.PI * t) * 26;
    s += `<use href="#${i % 2 ? 'mg-y' : 'mg-o'}" x="${f(x - 8)}" y="${f(y - 8)}" width="16" height="16"/>`;
  }
  return `<svg class="ph-garland" viewBox="0 0 ${w} 50" preserveAspectRatio="none" aria-hidden="true" focusable="false">${s}</svg>`;
}

/** the celebrations' ground: a carved jaali, as a tile */
export const jaali = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23C98F3E' stroke-opacity='.22' stroke-width='1.2'%3E%3Cpath d='M28 4L52 28L28 52L4 28Z'/%3E%3Ccircle cx='28' cy='28' r='7'/%3E%3C/g%3E%3Ccircle cx='0' cy='0' r='2' fill='%23C98F3E' fill-opacity='.25'/%3E%3Ccircle cx='56' cy='56' r='2' fill='%23C98F3E' fill-opacity='.25'/%3E%3Ccircle cx='56' cy='0' r='2' fill='%23C98F3E' fill-opacity='.25'/%3E%3Ccircle cx='0' cy='56' r='2' fill='%23C98F3E' fill-opacity='.25'/%3E%3C/svg%3E\")";

/** the ghat's stone steps, coming towards you below the river: lamps lit along them, marigold petals, two brass
    kalash with mango leaves. A band 1600 wide that the page hangs under the river layer, so scrolling down brings
    the steps up into view (it is drawn from its top: xMidYMin) */
export function ghatSteps() {
  const rand = rng(88);
  let steps = '', y = 0;
  const edges: number[] = [];
  for (let k = 0; k < 9; k++) {
    const tread = 26 + k * 9, riser = 10 + k * 3.2;
    steps += `<rect x="-20" y="${f(y)}" width="1640" height="${f(tread + 1)}" fill="${k % 2 ? '#EDD0A9' : '#F0D6B1'}"/>` +
      `<rect x="-20" y="${f(y + tread)}" width="1640" height="${f(riser + 1)}" fill="url(#rs)"/><rect x="-20" y="${f(y)}" width="1640" height="2" fill="#FFF3DF" opacity=".8"/>`;
    edges.push(y + tread);
    y += tread + riser;
  }
  /* joints between the stones */
  const joints: string[] = [];
  y = 0;
  for (let k = 0; k < 9; k++) {
    const tread = 26 + k * 9, w = 90 + k * 26;
    for (let x = -40 + (k % 2) * w * 0.5; x < 1640; x += w * (0.8 + rand() * 0.4)) joints.push(`M${f(x)} ${f(y + 3)}v${f(tread - 3)}`);
    y += tread + 10 + k * 3.2;
  }
  /* a row of lamps along three of the steps, bigger as they come nearer */
  let lamps = '';
  for (const [k, n] of [[2, 9], [4, 7], [6, 5]] as [number, number][]) {
    const s = 0.7 + k * 0.16, yy = edges[k] - 2;
    for (let i = 0; i < n; i++) {
      const x = 800 + (i - (n - 1) / 2) * (1600 / (n + 1)) * (0.62 + k * 0.03);
      lamps += diya(x, yy, s, 'g');
    }
  }
  /* petals scattered on the stone */
  const petals: string[][] = [[], []];
  for (let i = 0; i < 70; i++) {
    const yy = rand() * y, x = 800 + (rand() - 0.5) * 1500, r = 3 + (yy / y) * 6;
    petals[i % 2].push(`M${f(x - r)} ${f(yy)}a${f(r)} ${f(r * 0.6)} ${f(rand() * 180)} 1 0 ${f(2 * r)} 0a${f(r)} ${f(r * 0.6)} 0 1 0 ${f(-2 * r)} 0`);
  }
  /* a brass kalash with mango leaves and a coconut, each side */
  const kalash = (x: number, base: number, s: number) => `<g transform="translate(${f(x)} ${f(base)}) scale(${f(s)})">` +
    `<path d="M-30 0C-44 -18 -40 -52 -16 -62H16C40 -52 44 -18 30 0Z" fill="#D9A441"/><path d="M0 -62H16C40 -52 44 -18 30 0H0Z" fill="#B98326"/>` +
    `<rect x="-18" y="-70" width="36" height="10" rx="3" fill="#E3B565"/><path d="M-26 -30H26" stroke="#F3D58A" stroke-width="3"/><circle cx="0" cy="-36" r="6" fill="#C2410C"/>` +
    [-58, -34, -10, 14, 38].map((a, i) => `<path d="M0 -70C${f(-12 + a * 0.2)} ${f(-92 - (i % 2) * 6)} ${f(a * 0.9)} ${f(-104)} ${f(a * 1.3)} ${f(-96 + Math.abs(a) * 0.3)}C${f(a * 0.7)} ${f(-90)} ${f(a * 0.25)} ${f(-80)} 0 -70Z" fill="${i % 2 ? '#6F9A45' : '#5E8A3A'}"/>`).join('') +
    `<ellipse cx="0" cy="-86" rx="17" ry="20" fill="#8B5A2B"/><path d="M-6 -104C-2 -110 2 -110 6 -104" stroke="#6E8B3D" stroke-width="3" fill="none"/></g>`;
  return doc(
    steps + `<path d="${joints.join('')}" stroke="#D8B48C" stroke-width="2" opacity=".7"/>` +
    `<path d="${petals[0].join('')}" fill="#F29A22" opacity=".85"/><path d="${petals[1].join('')}" fill="#FFC531" opacity=".85"/>` +
    lamps + kalash(250, edges[5] - 2, 1.05) + kalash(1350, edges[5] - 2, 1.05),
    vgrad('rs', [[0, '#C39A72'], [1, '#D6B089']]) +
    `<radialGradient id="g-glow"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".85"/><stop offset="1" stop-color="#FFD480" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="g-glowW"><stop offset="0" stop-color="#FFF0C8" stop-opacity=".8"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient>`,
    `0 0 1600 ${f(y)}`, 'xMidYMin slice'
  );
}
