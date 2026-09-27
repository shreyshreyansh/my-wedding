// Small decor rendered at build time: hero feathers and grains, the schedule toran, ribbons, specks, the verse, split letters.
import { C } from './palette';

const DEVANAGARI = /[ऀ-ॿ]/;

export function featherSvg(P: boolean) {
  return '<svg viewBox="0 0 40 120" aria-hidden="true">' +
    '<path d="M20 118C20 90 20 50 20 12" stroke="' + (P ? C.zari : C.kajal) + '" stroke-width="1.6" fill="none"/>' +
    '<path d="M20 14C4 30 4 72 20 104C36 72 36 30 20 14Z" fill="' + (P ? C.zari : C.haldi) + '" fill-opacity="' + (P ? 0.9 : 1) + '"' + (P ? '' : ' stroke="' + C.kajal + '" stroke-width="2.2"') + '/>' +
    (P ? '' : '<path d="M20 14C4 30 4 72 20 104C36 72 36 30 20 14Z" fill="none" stroke="' + C.kagaz + '" stroke-width=".8"/>') +
    '<path d="M20 50 10 42M20 62 9 56M20 74 11 70M20 50 30 42M20 62 31 56M20 74 29 70" stroke="' + (P ? C.rani : C.kajal) + '" stroke-width="1" fill="none" opacity=".7"/>' +
    '<ellipse cx="20" cy="34" rx="9" ry="12" fill="' + (P ? C.mor : C.neel) + '"' + (P ? '' : ' stroke="' + C.kajal + '" stroke-width="1.6"') + '/>' +
    '<ellipse cx="20" cy="35" rx="5" ry="7" fill="' + (P ? C.rani : C.sindoor) + '"/>' +
    '<circle cx="20" cy="36" r="2" fill="' + (P ? C.zari : C.haldi) + '"/></svg>';
}
const grainSvg = (c: string) => '<svg viewBox="0 0 10 20" aria-hidden="true"><ellipse cx="5" cy="10" rx="4" ry="8" fill="' + c + '"/></svg>';

/* hero floaters: [x%, y%, width px, depth, kind]; depth > 1 sits in front of the names.
   Phones show the first seven; the rest carry .wide and are hidden below 600px. */
type Floater = [number, number, number, number, 'p' | 'm' | 'g1' | 'g2'];
const FLOAT: Floater[] = [
  [4, 14, 44, 0.5, 'p'], [88, 10, 40, 0.6, 'm'], [12, 58, 30, 0.35, 'g1'], [82, 52, 34, 0.9, 'p'],
  [2, 78, 56, 1.3, 'm'], [90, 80, 60, 1.4, 'p'], [30, 8, 22, 0.3, 'g2'], [66, 22, 22, 0.45, 'g1'],
  [48, 88, 26, 1.1, 'g2'], [22, 36, 36, 0.8, 'm'], [74, 70, 24, 0.7, 'g2'], [58, 4, 34, 0.55, 'p']
];
const PHONE_FLOATERS = 7;

export function floaters(layer: 'back' | 'front') {
  return FLOAT.map((it, i) => ({ it, i })).filter(({ it }) => (layer === 'front' ? it[3] > 1 : it[3] <= 1)).map(({ it: [x, y, w, d, k], i }) => {
    const inner = k === 'p' ? featherSvg(true) : k === 'm' ? featherSvg(false) : grainSvg(k === 'g1' ? C.zari : C.chuna);
    const wpx = k[0] === 'g' ? w * 0.35 : w;
    return '<span class="fl' + (i >= PHONE_FLOATERS ? ' wide' : '') + '" data-depth="' + d + '" style="left:' + x + '%;top:' + y + '%;width:' + wpx + 'px;opacity:' + (d > 1 ? 0.95 : (0.55 + d * 0.3).toFixed(2)) + '">' + inner + '</span>';
  }).join('');
}

/* the schedule's marigold toran: 13 strands, 7 on phones */
export function scheduleToran() {
  return Array.from({ length: 13 }, (_, i) =>
    '<span class="strand' + (i >= 7 ? ' wide' : '') + '" style="--d:' + (4 + (i % 4) * 0.7).toFixed(1) + 's;--dl:-' + (i * 0.6).toFixed(1) + 's"><svg viewBox="0 0 22 88" aria-hidden="true">' +
    '<path d="M11 6V70" stroke="' + C.sal + '" stroke-width="1.2"/>' +
    [14, 28, 42, 56].map((y, j) => '<circle cx="11" cy="' + y + '" r="6.5" fill="' + ((i + j) % 2 ? C.sindoor : C.haldi) + '"/><circle cx="11" cy="' + y + '" r="2.4" fill="' + ((i + j) % 2 ? C.haldi : C.sindoor) + '"/>').join('') +
    '<path d="M11 66C4 72 5 82 11 87C17 82 18 72 11 66Z" fill="' + C.sal + '"/></svg></span>'
  ).join('');
}

/* ribbons: text crossing in both scripts; four copies so the track can loop by 50% */
export function ribbonTrack(items: readonly string[]) {
  const one = items.map((t) => '<span class="item"' + (DEVANAGARI.test(t) ? ' lang="hi"' : '') + '>' + t + '<span class="gem" aria-hidden="true"></span></span>').join('');
  return one.repeat(4);
}

/* gold specks over the Mangalashtak */
export function specks(n = 16) {
  return Array.from({ length: n }, (_, i) => '<span class="speck" style="left:' + ((i * 37) % 96 + 2) + '%;top:' + ((i * 53) % 88 + 6) + '%"></span>').join('');
}

/* the verse, one span per word so it can light up word by word (never split into letters) */
export function verse(lines: readonly string[], rivers: readonly string[]) {
  return lines.map((line) =>
    '<span class="ln">' + line.split(' ').map((w) => '<span class="vw' + (rivers.includes(w) ? ' river' : '') + '">' + w + '</span>').join('') + '</span>'
  ).join('');
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Split Latin text into letters for the rise and wave. Devanagari is never split: conjuncts would break. */
export function letters(text: string, label = true) {
  if (DEVANAGARI.test(text)) return esc(text);
  const words = text.split(' ').map((w) => '<span class="word" aria-hidden="true">' + [...w].map((c) => '<span class="ch">' + esc(c) + '</span>').join('') + '</span>').join(' ');
  return (label ? '<span class="sr-only">' + esc(text) + '</span>' : '') + words;
}
