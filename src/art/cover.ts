// The cover: a Madhubani toran (mango leaves, marigold strands, a mauli thread), zari buttis that twinkle, a Paithani pallu.
// The toran and twinkles depend on the screen size, so they are made in the browser; the pallu is made at build time.
import { C, MARIGOLD, ZARI_HI } from './palette';
import { BODY, TAIL, BEAK, CREST, LEGS } from './peacock';

const leafSvg = '<svg width="22" height="56" viewBox="0 0 22 56" aria-hidden="true"><path d="M11 0V8" stroke="' + C.kajal + '" stroke-width="1"/>' +
  '<path d="M11 6C2 16 2 40 11 55C20 40 20 16 11 6Z" fill="' + C.sal + '" stroke="' + C.kajal + '" stroke-width="1.4" stroke-linejoin="round"/>' +
  '<path d="M11 10.5C5.5 19 5.5 38 11 50C16.5 38 16.5 19 11 10.5Z" fill="none" stroke="' + C.kagaz + '" stroke-width=".8" opacity=".75"/>' +
  '<path d="M11 10V52M11 20 7.5 16.5M11 20 14.5 16.5M11 29 7 25M11 29 15 25M11 38 7.5 34.5M11 38 14.5 34.5" fill="none" stroke="' + C.kajal + '" stroke-width=".9"/></svg>';

function strandSvg(n: number, k: number) {
  const ly = 14 + (n - 1) * 13 + 6;
  let g = '<path d="M11 0V' + ly + '" stroke="' + C.kajal + '" stroke-width=".9"/>';
  for (let j = 0; j < n; j++) {
    const y = 14 + j * 13;
    g += '<circle cx="11" cy="' + y + '" r="6.4" fill="' + ((j + k) % 2 ? MARIGOLD : C.haldi) + '" stroke="' + C.kajal + '" stroke-width=".9"/>' +
      '<circle cx="11" cy="' + y + '" r="3.4" fill="none" stroke="' + C.kajal + '" stroke-width=".7" stroke-dasharray="1.1 1.1"/><circle cx="11" cy="' + y + '" r="1.5" fill="' + C.sindoor + '"/>';
  }
  g += n >= 5
    ? '<path d="M11 ' + ly + 'C6 ' + (ly + 2) + ' 5 ' + (ly + 8) + ' 4 ' + (ly + 13) + 'H18C17 ' + (ly + 8) + ' 16 ' + (ly + 2) + ' 11 ' + ly + 'Z" fill="' + C.zari + '" stroke="' + C.kajal + '" stroke-width=".9"/><circle cx="11" cy="' + (ly + 15) + '" r="1.9" fill="' + C.kajal + '"/>'
    : '<path d="M11 ' + ly + 'C5 ' + (ly + 6) + ' 6 ' + (ly + 14) + ' 11 ' + (ly + 18) + 'C16 ' + (ly + 14) + ' 17 ' + (ly + 6) + ' 11 ' + ly + 'Z" fill="' + C.sal + '" stroke="' + C.kajal + '" stroke-width="1"/>';
  return '<svg width="22" height="' + (ly + 19) + '" viewBox="0 0 22 ' + (ly + 19) + '" aria-hidden="true">' + g + '</svg>';
}

/** Leaves and strands alternate; strands grow longer towards the edges. */
export function coverToran(width: number, phone: boolean) {
  const nHang = Math.max(11, Math.min(41, Math.round(width / 34) | 1)), hc = (nHang - 1) / 2, maxF = phone ? 7 : 8;
  return Array.from({ length: nHang }, (_, i) => {
    const off = Math.abs(i - hc);
    const inner = off % 2 ? strandSvg(2 + Math.round((maxF - 2) * Math.pow(off / hc, 2.6)), i) : leafSvg;
    return '<span class="hang" style="--d:' + (4.2 + (i % 5) * 0.55).toFixed(2) + 's;--dl:-' + ((i * 0.73) % 4).toFixed(2) + 's">' + inner + '</span>';
  }).join('');
}

/** Zari buttis on the 26px silk grid that twinkle in turn. */
export function twinkles(width: number, height: number, phone: boolean, random: () => number = Math.random) {
  const rand = (a: number, b: number) => a + random() * (b - a);
  const cols = Math.floor(width / 26), rows = Math.floor(height / 26);
  return Array.from({ length: phone ? 12 : 22 }, () =>
    '<span class="tw" style="left:' + 26 * (1 + Math.floor(random() * (cols - 1))) + 'px;top:' + 26 * (2 + Math.floor(random() * (rows - 3))) + 'px;--d:' + rand(4, 7).toFixed(2) + 's;--dl:-' + rand(0, 7).toFixed(2) + 's">' +
    '<svg viewBox="0 0 12 12"><path d="M6 0 7 5 12 6 7 7 6 12 5 7 0 6 5 5Z" fill="' + ZARI_HI + '"/></svg></span>').join('');
}

/** The pallu's repeating motif: two small peacocks either side of a lotus, as a CSS background data URI. */
export function palluBackground() {
  const pk = (tx: number, sx: number) => '<g transform="translate(' + tx + ' -2.8) scale(' + sx + ' .28)"><path d="' + TAIL + '" fill="' + C.mor + '"/>' +
    '<circle cx="16" cy="142" r="5.5" fill="' + C.rani + '"/><circle cx="16" cy="142" r="2.2" fill="' + ZARI_HI + '"/><circle cx="30" cy="149" r="5" fill="' + C.rani + '"/><circle cx="30" cy="149" r="2" fill="' + ZARI_HI + '"/>' +
    '<path d="' + BODY + '" fill="' + C.mor + '"/><ellipse cx="58" cy="104" rx="17" ry="11" fill="' + C.rani + '"/><path d="' + BEAK + '" fill="' + C.kajal + '"/>' +
    '<path d="' + CREST + '" stroke="' + C.mor + '" stroke-width="3.2" stroke-linecap="round"/><circle cx="80" cy="30" r="3.4" fill="' + C.rani + '"/><circle cx="88" cy="28" r="3.4" fill="' + C.rani + '"/><circle cx="96" cy="30" r="3.4" fill="' + C.rani + '"/>' +
    '<circle cx="87" cy="47" r="3" fill="' + C.chuna + '"/><path d="' + LEGS + '" stroke="' + C.kajal + '" stroke-width="3.4" stroke-linecap="round"/></g>';
  const lotus = ['M60 38C54 31 55 20 60 11C65 20 66 31 60 38Z', 'M60 38C52 37 47 30 48 22C54 24 58 30 60 38Z', 'M60 38C68 37 73 30 72 22C66 24 62 30 60 38Z']
    .map((d) => '<path d="' + d + '" fill="' + C.rani + '" stroke="' + C.mor + '" stroke-width=".9"/>').join('') + '<path d="M50 40.5H70" stroke="' + C.mor + '" stroke-width="1.6" stroke-linecap="round"/>';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="46" viewBox="0 0 120 46"><path d="M0 2.5H120M0 43.5H120" stroke="' + C.mor + '" stroke-width="1.2" stroke-dasharray="2 2"/>' +
    pk(14, 0.28) + '' + lotus + pk(106, -0.28) + '</svg>';
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}
