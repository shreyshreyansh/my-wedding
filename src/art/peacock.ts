// The peacock pair: hers drawn as gold on Paithani silk ('p'), his as a double kajal line on Madhubani paper ('m').
// Pure SVG-string functions, rendered at build time.
import { C, f } from './palette';

export type Side = 'p' | 'm';
export type FanMode = 'open' | 'closed' | 'none';
export type Pose = 'apart' | 'haldi' | 'meet' | 'garland' | 'dance';

export const BODY = 'M34 118C28 96 44 80 64 84C66 70 62 52 74 44C80 39 90 40 93 46C96 52 90 57 86 60C80 66 80 76 84 86C92 100 86 118 70 124C54 130 38 128 34 118Z';
export const TAIL = 'M36 112C20 118 6 128 2 142C10 150 24 156 40 156C44 144 46 132 44 122Z';
export const BEAK = 'M93 44 104 47 93 50Z';
export const CREST = 'M84 42 80 30M88 40 88 28M92 42 96 30';
export const LEGS = 'M58 128 56 144M68 126 70 142';

export function fan(P: boolean) {
  const cx = 38, cy = 112, r0 = 8, r1 = 46, re = 54, rx = 10, ry = 6.5, rin = 3.2;
  let s = '';
  for (let i = 0; i < 9; i++) {
    const a = (160 + (130 * i) / 8) * Math.PI / 180, c = Math.cos(a), si = Math.sin(a);
    const ex = cx + re * c, ey = cy + re * si, deg = f(a * 180 / Math.PI);
    const x0 = ex - rx * c, y0 = ey - rx * si, x1 = ex + rx * c, y1 = ey + rx * si;
    s += '<g class="feather">' +
      '<path class="f-line" pathLength="1" d="M' + f(cx + r0 * c) + ' ' + f(cy + r0 * si) + 'L' + f(cx + r1 * c) + ' ' + f(cy + r1 * si) + '" fill="none" stroke="' + (P ? C.zari : C.kajal) + '" stroke-width="' + (P ? 1.6 : 1.8) + '" stroke-linecap="round"/>' +
      '<path class="f-eye" d="M' + f(x0) + ' ' + f(y0) + 'A' + rx + ' ' + ry + ' ' + deg + ' 1 0 ' + f(x1) + ' ' + f(y1) + 'A' + rx + ' ' + ry + ' ' + deg + ' 1 0 ' + f(x0) + ' ' + f(y0) + 'Z" fill="' + (P ? C.mor : C.haldi) + '" stroke="' + (P ? C.zari : C.kajal) + '" stroke-width="' + (P ? 1.4 : 2.2) + '"/>' +
      '<circle class="f-in" cx="' + f(ex + 1.5 * c) + '" cy="' + f(ey + 1.5 * si) + '" r="' + rin + '" fill="' + (P ? C.rani : C.neel) + '"/>' +
      '</g>';
  }
  return '<g class="fan">' + s + '</g>';
}

function eyes(o: string, i: string) {
  return [[12, 138], [24, 149], [37, 148]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="6.5" fill="' + o + '"/><circle cx="' + x + '" cy="' + y + '" r="3" fill="' + i + '"/>').join('');
}

export function peacock(side: Side, place: string, fanMode: FanMode) {
  const P = side === 'p';
  const fanG = fanMode === 'none' ? '' : fan(P);
  const tailHidden = fanMode === 'open' ? ' style="display:none"' : '';
  const tail = P
    ? '<path d="' + TAIL + '" fill="' + C.zari + '"/>' + eyes(C.mor, C.rani)
    : '<path d="' + TAIL + '" fill="' + C.sal + '" stroke="' + C.kajal + '" stroke-width="4.2" stroke-linejoin="round"/><path d="' + TAIL + '" fill="none" stroke="' + C.kagaz + '" stroke-width="1.3"/>' + eyes(C.haldi, C.sindoor);
  const body = P
    ? '<path d="' + BODY + '" fill="' + C.zari + '"/><path d="' + BEAK + '" fill="' + C.zari + '"/><path d="' + LEGS + '" stroke="' + C.zari + '" stroke-width="2" stroke-linecap="round"/><path d="M46 104C56 96 72 98 80 108" fill="none" stroke="' + C.rani + '" stroke-width="2" stroke-linecap="round"/><circle cx="88" cy="47" r="2" fill="' + C.rani + '"/>'
    : '<path d="' + BODY + '" fill="' + C.neel + '" stroke="' + C.kajal + '" stroke-width="4.2" stroke-linejoin="round"/><path d="' + BODY + '" fill="none" stroke="' + C.kagaz + '" stroke-width="1.3"/><path d="' + BEAK + '" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="2.4" stroke-linejoin="round"/><path d="' + LEGS + '" stroke="' + C.kajal + '" stroke-width="2" stroke-linecap="round"/><path d="M46 104C56 96 72 98 80 108M50 108 54 100M58 108 61 99M66 109 68 100M74 110 75 102" fill="none" stroke="' + C.kagaz + '" stroke-width="1.6" stroke-linecap="round"/><circle cx="88" cy="47" r="2.4" fill="' + C.kagaz + '"/><circle cx="88" cy="47" r="1.1" fill="' + C.kajal + '"/>';
  const crest = P
    ? '<path d="' + CREST + '" stroke="' + C.zari + '" stroke-width="2" stroke-linecap="round"/>' + [[80, 29], [88, 27], [96, 29]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="2.6" fill="' + C.zari + '"/>').join('')
    : '<path d="' + CREST + '" stroke="' + C.kajal + '" stroke-width="2" stroke-linecap="round"/>' + [[80, 29], [88, 27], [96, 29]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="2.8" fill="' + C.sindoor + '"/>').join('');
  return '<g class="pk pk-' + (P ? 'l' : 'r') + '"><g transform="' + place + '">' + fanG + '<g class="tail"' + tailHidden + '>' + tail + '</g>' + body + '<g class="crest">' + crest + '</g></g></g>';
}

/** A garland of alternating haldi and sindoor beads along a quadratic curve. */
export function beads(p0: number[], p1: number[], p2: number[], n: number, r: number) {
  let s = '';
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
    const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
    s += '<circle class="bead" cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="' + (i % 2 ? C.sindoor : C.haldi) + '"/>';
  }
  return '<g class="garland">' + s + '</g>';
}

const PLACE: Record<Pose, [string, string]> = {
  apart: ['translate(14 44) scale(1.15)', 'translate(306 44) scale(-1.15 1.15)'],
  haldi: ['translate(14 44) scale(1.15)', 'translate(306 44) scale(-1.15 1.15)'],
  meet: ['translate(40 44) scale(1.15)', 'translate(280 44) scale(-1.15 1.15)'],
  garland: ['translate(40 44) scale(1.15)', 'translate(280 44) scale(-1.15 1.15)'],
  dance: ['translate(34 62) scale(1.05)', 'translate(286 62) scale(-1.05 1.05)']
};

/** The round medallion: a disc split silk | paper, zari and kajal rings drawn as paths so they can draw themselves. */
export function frame() {
  return '<path class="disc" d="M160 12A148 148 0 0 0 160 308Z" fill="' + C.rani + '"/>' +
    '<path class="disc" d="M160 12A148 148 0 0 1 160 308Z" fill="' + C.kagaz + '"/>' +
    '<path class="ring-draw" pathLength="1" d="M160 18A142 142 0 0 0 160 302" fill="none" stroke="' + C.zari + '" stroke-width="8"/>' +
    '<path class="ring-m" d="M160 18A142 142 0 0 1 160 302" fill="none" stroke="' + C.kajal + '" stroke-width="9" stroke-dasharray="1.6 3.2"/>' +
    '<path class="ring-draw" pathLength="1" d="M160 10A150 150 0 0 1 160 310" fill="none" stroke="' + C.kajal + '" stroke-width="2.5"/>' +
    '<path class="ring-draw" pathLength="1" d="M160 26A134 134 0 0 1 160 294" fill="none" stroke="' + C.kajal + '" stroke-width="2.5"/>' +
    '<path class="ring-draw" pathLength="1" d="M160 10A150 150 0 0 0 160 310" fill="none" stroke="' + C.zari + '" stroke-width="2"/>' +
    '<path class="ring-draw" pathLength="1" d="M160 26A134 134 0 0 0 160 294" fill="none" stroke="' + C.zari + '" stroke-width="2"/>';
}

export function medallion(pose: Pose, fanMode: FanMode) {
  const [pl, pr] = PLACE[pose];
  let center = '';
  if (pose === 'apart') center = '<g class="bud"><path d="M160 268C150 256 150 240 160 228Z" fill="' + C.rani + '" stroke="' + C.zari + '" stroke-width="2"/><path d="M160 268C170 256 170 240 160 228Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="2.4"/></g>';
  if (pose === 'meet') {
    const pet = 'M0 0C-16-16-14-44 0-58C14-44 16-16 0 0Z';
    center = '<g class="lotus" transform="translate(160 272)">' +
      [-60, -30].map((a) => '<path transform="rotate(' + a + ')" d="' + pet + '" fill="' + C.rani + '" stroke="' + C.zari + '" stroke-width="2"/>').join('') +
      [60, 30].map((a) => '<path transform="rotate(' + a + ')" d="' + pet + '" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="2.6"/>').join('') +
      '<path d="M0 0C-16-16-14-44 0-58Z" fill="' + C.rani + '" stroke="' + C.zari + '" stroke-width="2"/><path d="M0 0C16-16 14-44 0-58Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="2.6"/></g>';
  }
  if (pose === 'haldi') center = '<g class="bowl"><path d="M126 246H194A34 26 0 0 1 126 246Z" fill="' + C.zari + '" stroke="' + C.kajal + '" stroke-width="2.6" stroke-linejoin="round"/><path d="M134 246C140 230 180 230 186 246Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="2"/><path d="M134 258H186" stroke="' + C.kajal + '" stroke-width="1.4"/></g>';
  const garland = pose === 'garland' ? beads([64, 118], [160, 8], [256, 118], 16, 5) : '';
  return '<svg viewBox="0 0 320 320" aria-hidden="true"><g class="medal">' + frame() +
    garland + peacock('p', pl, fanMode) + peacock('m', pr, fanMode) + center + '</g></svg>';
}

/** The meeting scene: both peacocks with closed fans and the garland they exchange. */
export function meetingScene() {
  return beads([150, 94], [200, -6], [250, 94], 12, 4.6) +
    peacock('p', 'translate(85.6 44) scale(1.1)', 'closed') +
    peacock('m', 'translate(314.4 44) scale(-1.1 1.1)', 'closed');
}
