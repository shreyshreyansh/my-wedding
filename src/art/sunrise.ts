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

/** a tree as an illustrator draws one: a cluster of round shapes, dark, then mid, then lit on the side facing the sun */
function tree(x: number, y: number, s: number, rand: () => number, toSun: number) {
  const n = 4 + Math.floor(rand() * 3), r = 13 * s, blobs: P[] = [];
  for (let i = 0; i < n; i++) blobs.push([x + (rand() - 0.5) * r * 2.2, y - r * (0.9 + rand() * 1.5)]);
  const sx = toSun * r * 0.22;
  const dark = blobs.map(([bx, by]) => `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r * (0.85 + rand() * 0.3))}"/>`).join('');
  const mid = blobs.map(([bx, by]) => `<circle cx="${f(bx + sx)}" cy="${f(by - r * 0.22)}" r="${f(r * 0.72)}"/>`).join('');
  const lit = blobs.filter(([, by]) => by < y - r * 1.4).map(([bx, by]) => `<circle cx="${f(bx + sx * 1.8)}" cy="${f(by - r * 0.42)}" r="${f(r * 0.38)}"/>`).join('');
  return `<g fill="${C.treeDark}">${dark}</g><g fill="${C.tree}">${mid}</g><g fill="${C.treeLit}">${lit}</g>`;
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

export function scene() {
  const rand = rng(20261209);

  /* the sun: a wide glow and a soft disc; the disc rises on its own (motion/hero.ts) */
  const sun = svg(
    `<circle cx="800" cy="600" r="560" fill="url(#sr-halo)"/><circle cx="800" cy="600" r="210" fill="url(#sr-halo2)"/>` +
    `<circle cx="800" cy="600" r="74" fill="url(#sr-disc)"/>`,
    `<radialGradient id="sr-halo"><stop offset="0" stop-color="#FFE7BD" stop-opacity=".95"/><stop offset=".35" stop-color="#FFDDB0" stop-opacity=".55"/><stop offset="1" stop-color="#FFD6A8" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="sr-halo2"><stop offset="0" stop-color="#FFF6E2" stop-opacity=".95"/><stop offset="1" stop-color="#FFEBC8" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="sr-disc"><stop offset="0" stop-color="#FFFDF6"/><stop offset=".8" stop-color="#FFF6DF"/><stop offset="1" stop-color="#FFEFD0" stop-opacity="0"/></radialGradient>`
  );

  /* clouds: streaks across the glow, a puff or two near the middle for a phone, banks in the corners for a laptop */
  let streaks = '';
  for (let i = 0; i < 9; i++) {
    const y = 380 + rand() * 190, x = 120 + rand() * 1360, rx = 120 + rand() * 260;
    streaks += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(4 + rand() * 6)}" fill="#FFF7EC" opacity="${f(0.35 + rand() * 0.35)}"/>`;
  }
  const birds = [[930, 452, 1], [962, 438, 0.8], [985, 462, 0.7], [1010, 446, 0.6]].map(([x, y, s]) =>
    `<path d="M${f(x - 9 * s)} ${f(y - 3 * s)}Q${f(x - 4 * s)} ${f(y - 6 * s)} ${f(x)} ${f(y)}Q${f(x + 4 * s)} ${f(y - 6 * s)} ${f(x + 9 * s)} ${f(y - 3 * s)}" stroke="#8C5A3C" stroke-width="${f(1.8 * s)}" fill="none" stroke-linecap="round"/>`).join('');
  const clouds = svg(
    streaks +
    cloud(190, 250, 420, rand, 'sr-cl', 11) + cloud(1420, 190, 460, rand, 'sr-cl', 11) + cloud(1180, 330, 200, rand, 'sr-cl', 7) +
    cloud(640, 395, 170, rand, 'sr-cl', 7) + cloud(1000, 300, 150, rand, 'sr-cl', 6) + cloud(330, 420, 160, rand, 'sr-cl', 6) + birds,
    vgrad('sr-cl', [[0, C.cloud], [0.7, '#FFF0DE'], [1, C.cloudLo]])
  );

  /* far: Ranchi's rounded plateau hills on the left, the Sahyadri's mesas on the right, a faint range behind both */
  const back = ridge([[-60, 650], [220, 628], [520, 640], [800, 652], [1080, 626], [1380, 640], [1660, 630]], 5, rand);
  const ranchi = ridge([[-60, 636], [80, 598], [210, 586], [330, 610], [440, 588], [545, 556], [640, 574], [730, 604], [820, 640], [900, 660]], 7, rand);
  const pune1 = mesa(830, 1250, 528, 668, rand), pune2 = mesa(1150, 1700, 552, 672, rand), pune0 = mesa(1300, 1640, 506, 600, rand);
  const far = svg(
    `<path d="${down(back, curve(back))}" fill="${C.far0}"/>` +
    `<path d="${down(pune0, line(pune0))}" fill="${C.far0}"/>` +
    `<path d="${down(pune1, line(pune1))}" fill="url(#sr-far)"/><path d="${line(pune1)}" fill="none" stroke="${C.rimFar}" stroke-width="2.2"/>` +
    `<path d="${down(pune2, line(pune2))}" fill="url(#sr-far)"/><path d="${line(pune2)}" fill="none" stroke="${C.rimFar}" stroke-width="2.2"/>` +
    `<path d="${down(ranchi, curve(ranchi))}" fill="url(#sr-far)"/><path d="${curve(ranchi)}" fill="none" stroke="${C.rimFar}" stroke-width="2.2"/>`,
    vgrad('sr-far', [[0, C.far], [0.2, C.farLo]])
  );

  /* mid: the two temple hills */
  const left = ridge([[-60, 702], [140, 690], [300, 672], [440, 642], [560, 604], [640, 582], [690, 584], [750, 612], [820, 672], [880, 728]], 6, rand, 28);
  const right = ridge([[720, 732], [800, 694], [870, 646], [930, 606], [975, 592], [1030, 593], [1085, 612], [1170, 650], [1310, 680], [1480, 694], [1660, 700]], 6, rand, 28);
  /* Parvati's steps climbing the hill */
  const steps = `<path d="M1150 652L1110 636L1128 626L1090 614L1104 604L1060 598" fill="none" stroke="${C.rimMid}" stroke-width="2.4" stroke-dasharray="3 3" opacity=".9"/>`;
  const mid = svg(
    `<path d="${down(right, curve(right))}" fill="url(#sr-mid)"/><path d="${curve(right)}" fill="none" stroke="${C.rimMid}" stroke-width="2.4"/>` + steps +
    `<path d="${down(left, curve(left))}" fill="url(#sr-mid)"/><path d="${curve(left)}" fill="none" stroke="${C.rimMid}" stroke-width="2.4"/>` +
    temple(664, 586, 0.86) + temple(1004, 596, 0.74, false) + chhatri(964, 598, 0.42) + chhatri(1044, 598, 0.42),
    vgrad('sr-mid', [[0, C.mid], [0.14, C.midLo]])
  );

  /* near: mist, the banks and their trees, the river, its ghat, lotuses and diyas */
  const mist = `<rect x="-20" y="600" width="1640" height="150" fill="url(#sr-mist)"/>`;
  const lEdge: P[] = [[772, 716], [720, 744], [640, 784], [540, 834], [420, 892], [260, 960], [150, 1004]];
  const rEdge: P[] = [[828, 716], [884, 742], [968, 780], [1080, 826], [1220, 884], [1380, 950], [1500, 1004]];
  const lTop = ridge([[-60, 706], [300, 712], [600, 714], [772, 716]], 3, rand, 40);
  const rTop = ridge([[828, 716], [1100, 714], [1400, 710], [1660, 706]], 3, rand, 40);
  const leftBank = curve(lTop) + lEdge.slice(1).map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + `L-60 1004Z`;
  const rightBank = 'M' + f(rEdge[0][0]) + ' ' + f(rEdge[0][1]) + curve(rTop).replace(/^M[^C]+/, '') + `L1660 1004L${f(rEdge[rEdge.length - 1][0])} 1004` + [...rEdge].reverse().slice(1).map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + 'Z';
  const river = `M${f(lEdge[0][0])} ${f(lEdge[0][1])}` + lEdge.slice(1).map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + [...rEdge].reverse().map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + 'Z';

  /* the sun's path on the water, wider as it comes closer */
  let glitter = '';
  for (let y = 722; y < 1000; y += 9 + (y - 716) * 0.03) {
    const t = (y - 716) / 284, n = 1 + Math.floor(t * 3);
    for (let k = 0; k < n; k++) {
      const w = 10 + t * 70 * (0.5 + rand()), x = 800 + (rand() - 0.5) * (12 + t * 160);
      glitter += `<rect x="${f(x - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(1.6 + t * 2.4)}" rx="1.5" fill="#FFFBF0" opacity="${f(0.9 - t * 0.5)}"/>`;
    }
  }
  let ripples = '';
  for (let i = 0; i < 26; i++) {
    const y = 730 + rand() * 260, t = (y - 716) / 284, cx = 800 + (rand() - 0.5) * (120 + t * 900), w = 20 + t * 90 * rand();
    ripples += `<path d="M${f(cx - w / 2)} ${f(y)}h${f(w)}" stroke="${C.water2}" stroke-width="${f(1 + t * 1.4)}" stroke-linecap="round" opacity=".55"/>`;
  }
  /* the trees' shadow on the water at the far end */
  const shade = `<path d="M772 716L828 716L850 728Q800 733 750 728Z" fill="${C.treeDark}" opacity=".25"/>`;

  /* trees, smaller towards the middle where the bank is far away */
  let trees = '';
  const row = (x0: number, x1: number, side: number) => {
    for (let x = x0; side < 0 ? x < x1 : x < x1; x += 15 + rand() * 12) {
      const d = Math.abs(x - 800) / 800, s = 0.45 + d * 1.15;
      const y = side < 0 ? 712 + d * 2 : 714 + d * 2;
      trees += tree(x, y + 3, s * (0.85 + rand() * 0.3), rand, x < 800 ? 1 : -1);
    }
  };
  row(-40, 760, -1);
  row(842, 1650, 1);
  const palms = palm(118, 712, 150, 14) + palm(176, 714, 118, -8) + palm(1488, 712, 136, -12) + palm(612, 714, 70, 6);

  /* the ghat: stone steps down to the water on her side's bank, a chhatri at the top */
  let ghat = '';
  for (let k = 0; k < 6; k++) {
    const o = k * 9;
    const a: P = [560 - o * 1.9, 830 + o * 0.6], b: P = [372 - o * 1.9, 914 + o * 0.6];
    ghat += `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}L${f(b[0] - 14)} ${f(b[1] - 2)}L${f(a[0] - 14)} ${f(a[1] - 2)}Z" fill="${C.stone}"/>` +
      `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}l0 3.5L${f(a[0])} ${f(a[1] + 3.5)}Z" fill="${C.riser}"/>`;
  }
  ghat = `<g transform="translate(-8 -14)">${ghat}</g>` + chhatri(472, 830, 0.95);

  const lotuses = [[590, 948, 1.05], [626, 972, 0.8], [1010, 960, 1.1], [1052, 944, 0.75], [248, 984, 1.3], [1330, 934, 1.15], [1380, 968, 0.9], [690, 820, 0.55]];
  const pads = lotuses.map(([x, y, s], i) => pad(x - 20 * s, y + 6 * s, s, i % 2 ? 6 : -5) + pad(x + 22 * s, y + 9 * s, s * 0.85, i % 2 ? -4 : 8) + pad(x + 4 * s, y + 16 * s, s * 0.7, 2)).join('');
  const flowers = lotuses.map(([x, y, s]) => lotus(x, y + 4 * s, s)).join('');
  const diyas = [[742, 872, 0.62], [800, 846, 0.5], [866, 900, 0.7], [776, 962, 0.95], [930, 838, 0.46], [688, 920, 0.78], [902, 978, 1]]
    .map(([x, y, s]) => diya(x, y, s, 'sr')).join('');

  const near = svg(
    mist + `<path d="${river}" fill="url(#sr-water)"/>` + shade + ripples + glitter +
    `<path d="${leftBank}" fill="url(#sr-bank)"/><path d="${rightBank}" fill="url(#sr-bank)"/>` +
    `<path d="${line(lEdge)}" fill="none" stroke="#FFF3E0" stroke-width="2" opacity=".7"/><path d="${line(rEdge)}" fill="none" stroke="#FFF3E0" stroke-width="2" opacity=".7"/>` +
    trees + palms + ghat + pads + flowers + diyas,
    vgrad('sr-mist', [[0, '#FFF6EA', 0], [0.62, '#FFF6EA', 0.7], [1, '#FFF6EA', 0]]) +
    vgrad('sr-water', [[0, C.water0], [0.45, C.water1], [1, C.water2]]) +
    vgrad('sr-bank', [[0, C.bank], [1, C.bankLo]]) +
    `<radialGradient id="sr-glow"><stop offset="0" stop-color="#FFE3A0" stop-opacity=".85"/><stop offset="1" stop-color="#FFD480" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="sr-glowW"><stop offset="0" stop-color="#FFF0C8" stop-opacity=".8"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient>`
  );

  return { sun, clouds, far, mid, near };
}

/* ---------- the cover's clouds: two banks that part when the invitation opens ---------- */

export function coverClouds(side: 'l' | 'r') {
  const rand = rng(side === 'l' ? 7 : 11);
  /* drawn as the left bank; the right one is its mirror. The edge at x = 800 billows, the rest is solid */
  let shade = '', body = '', lit = '';
  for (let i = 0; i < 26; i++) {
    const y = -40 + i * 42 + (rand() - 0.5) * 20, r = 70 + rand() * 70, x = 690 + (rand() - 0.5) * 120 + Math.sin(i * 1.3) * 40;
    shade += `<circle cx="${f(x + 8)}" cy="${f(y + 14)}" r="${f(r)}"/>`;
    body += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.96)}"/>`;
    if (i % 2) lit += `<circle cx="${f(x - r * 0.25)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.45)}"/>`;
  }
  for (let i = 0; i < 18; i++) {
    const x = rand() * 640, y = rand() * 1000, r = 60 + rand() * 90;
    lit += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" opacity=".55"/>`;
  }
  const g = `<rect x="-10" y="-10" width="700" height="1020" fill="url(#cc-${side})"/>` +
    `<g fill="${C.cloudShade}">${shade}</g><g fill="url(#cc-${side})">${body}</g><g fill="#FFF9F0" opacity=".7">${lit}</g>`;
  const defs = `<linearGradient id="cc-${side}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDEBD6"/><stop offset=".6" stop-color="#F9E1C6"/><stop offset="1" stop-color="#F2CFAE"/></linearGradient>`;
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
