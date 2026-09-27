// Verbatim port of the prototype's inline script (design/prototype/motion-prototype.html).
// Temporary: M1 splits it into src/art and src/scripts/motion modules. GSAP and Lenis now come from npm, not a CDN.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.Lenis = Lenis;

(() => {
  const C = { rani:'#A3195B', mor:'#0E5C63', zari:'#C9A04A', chuna:'#F5EFE3', kagaz:'#EFE3C8', kajal:'#2B211B', sindoor:'#B3261E', haldi:'#D99A1E', neel:'#2F3E73', sal:'#5E6B3A', deep:'#7A3522' };
  const BODY = 'M34 118C28 96 44 80 64 84C66 70 62 52 74 44C80 39 90 40 93 46C96 52 90 57 86 60C80 66 80 76 84 86C92 100 86 118 70 124C54 130 38 128 34 118Z';
  const TAIL = 'M36 112C20 118 6 128 2 142C10 150 24 156 40 156C44 144 46 132 44 122Z';
  const BEAK = 'M93 44 104 47 93 50Z';
  const CREST = 'M84 42 80 30M88 40 88 28M92 42 96 30';
  const LEGS = 'M58 128 56 144M68 126 70 142';
  const f = (n) => n.toFixed(1);
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- drawing ---------- */
  function fan(P) {
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
  function eyes(o, i) {
    return [[12, 138], [24, 149], [37, 148]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="6.5" fill="' + o + '"/><circle cx="' + x + '" cy="' + y + '" r="3" fill="' + i + '"/>').join('');
  }
  function peacock(side, place, fanMode) {
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
  function beads(p0, p1, p2, n, r) {
    let s = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
      const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
      s += '<circle class="bead" cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="' + (i % 2 ? C.sindoor : C.haldi) + '"/>';
    }
    return '<g class="garland">' + s + '</g>';
  }
  const PLACE = {
    apart: ['translate(14 44) scale(1.15)', 'translate(306 44) scale(-1.15 1.15)'],
    haldi: ['translate(14 44) scale(1.15)', 'translate(306 44) scale(-1.15 1.15)'],
    meet: ['translate(40 44) scale(1.15)', 'translate(280 44) scale(-1.15 1.15)'],
    garland: ['translate(40 44) scale(1.15)', 'translate(280 44) scale(-1.15 1.15)'],
    dance: ['translate(34 62) scale(1.05)', 'translate(286 62) scale(-1.05 1.05)']
  };
  function medallion(pose, fanMode) {
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
    return '<svg viewBox="0 0 320 320" aria-hidden="true"><g class="medal">' +
      '<path class="disc" d="M160 12A148 148 0 0 0 160 308Z" fill="' + C.rani + '"/>' +
      '<path class="disc" d="M160 12A148 148 0 0 1 160 308Z" fill="' + C.kagaz + '"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 18A142 142 0 0 0 160 302" fill="none" stroke="' + C.zari + '" stroke-width="8"/>' +
      '<path class="ring-m" d="M160 18A142 142 0 0 1 160 302" fill="none" stroke="' + C.kajal + '" stroke-width="9" stroke-dasharray="1.6 3.2"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 10A150 150 0 0 1 160 310" fill="none" stroke="' + C.kajal + '" stroke-width="2.5"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 26A134 134 0 0 1 160 294" fill="none" stroke="' + C.kajal + '" stroke-width="2.5"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 10A150 150 0 0 0 160 310" fill="none" stroke="' + C.zari + '" stroke-width="2"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 26A134 134 0 0 0 160 294" fill="none" stroke="' + C.zari + '" stroke-width="2"/>' +
      garland + peacock('p', pl, fanMode) + peacock('m', pr, fanMode) + center + '</g></svg>';
  }
  /* ---------- event props: drawn half Paithani (gold on silk), half Madhubani (double line on paper) ---------- */
  let clipUid = 0;
  function frame() {
    return '<path class="disc" d="M160 12A148 148 0 0 0 160 308Z" fill="' + C.rani + '"/>' +
      '<path class="disc" d="M160 12A148 148 0 0 1 160 308Z" fill="' + C.kagaz + '"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 18A142 142 0 0 0 160 302" fill="none" stroke="' + C.zari + '" stroke-width="8"/>' +
      '<path class="ring-m" d="M160 18A142 142 0 0 1 160 302" fill="none" stroke="' + C.kajal + '" stroke-width="9" stroke-dasharray="1.6 3.2"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 10A150 150 0 0 1 160 310" fill="none" stroke="' + C.kajal + '" stroke-width="2.5"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 26A134 134 0 0 1 160 294" fill="none" stroke="' + C.kajal + '" stroke-width="2.5"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 10A150 150 0 0 0 160 310" fill="none" stroke="' + C.zari + '" stroke-width="2"/>' +
      '<path class="ring-draw" pathLength="1" d="M160 26A134 134 0 0 0 160 294" fill="none" stroke="' + C.zari + '" stroke-width="2"/>';
  }
  const HALDI_Y = '#E8B326';
  const ART = {
    haldi: (clip) =>
      '<g clip-path="url(#' + clip + ')">' + Array.from({ length: 11 }, (_, i) => '<ellipse class="petal" cx="' + (58 + (i * 23) % 204) + '" cy="' + (40 + (i * 29) % 90) + '" rx="4" ry="6.5" fill="' + (i % 2 ? '#E27A1B' : C.haldi) + '"/>').join('') + '</g>' +
      '<path d="M84 258C84 252 92 250 100 252C106 250 114 251 118 255C119 259 114 262 106 261C98 263 88 263 84 258Z" fill="' + C.zari + '"/><path d="M96 252C96 246 101 244 104 247C105 250 102 252 100 252Z" fill="' + C.zari + '"/><path d="M94 253C93 256 93 259 94 262M106 252C105 255 105 258 106 261" fill="none" stroke="' + C.rani + '" stroke-width="1.2"/>' +
      '<path d="M236 258C236 252 228 250 220 252C214 250 206 251 202 255C201 259 206 262 214 261C222 263 232 263 236 258Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.8" stroke-linejoin="round"/><path d="M224 252C224 246 219 244 216 247C215 250 218 252 220 252Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M226 253C227 256 227 259 226 262M214 252C215 255 215 258 214 261" fill="none" stroke="' + C.kajal + '" stroke-width="1.2"/>' +
      '<g class="bowl"><path d="M160 212H110A50 34 0 0 0 160 246Z" fill="' + C.zari + '"/><path d="M160 212H210A50 34 0 0 1 160 246Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M114 212C122 198 140 192 160 192V212Z" fill="' + HALDI_Y + '"/><path d="M160 192C180 192 198 198 206 212H160Z" fill="' + HALDI_Y + '" stroke="' + C.kajal + '" stroke-width="2"/>' +
      '<path d="M106 212H160" stroke="' + C.zari + '" stroke-width="3.2" stroke-linecap="round"/><path d="M160 212H214" stroke="' + C.kajal + '" stroke-width="3.2" stroke-linecap="round"/>' +
      '<circle cx="124" cy="226" r="2.4" fill="' + C.rani + '"/><circle cx="138" cy="232" r="2.4" fill="' + C.rani + '"/><circle cx="152" cy="235" r="2.4" fill="' + C.rani + '"/>' +
      '<path d="M172 222l5 11M184 220l5 11M196 217l4 9" stroke="' + C.kajal + '" stroke-width="1.4" stroke-linecap="round"/></g>' +
      [[130, 188], [121, 182], [139, 179]].map(([x, y]) => '<circle class="splash sl" cx="' + x + '" cy="' + y + '" r="3.2" fill="' + HALDI_Y + '"/>').join('') +
      [[190, 188], [199, 182], [181, 179]].map(([x, y]) => '<circle class="splash sr" cx="' + x + '" cy="' + y + '" r="3.2" fill="' + HALDI_Y + '" stroke="' + C.kajal + '" stroke-width="1"/>').join('') +
      '<g class="leaf-l" transform="translate(100 92)"><path d="M0 0C24 12 44 44 44 90C22 74 4 40 0 0Z" fill="' + C.zari + '"/><path d="M0 0C18 28 34 58 44 90" fill="none" stroke="' + C.rani + '" stroke-width="1.6"/><path d="M14 22 24 20M22 40 34 40M30 58 40 60" stroke="' + C.rani + '" stroke-width="1.2"/><path d="M36 76C40 82 43 86 44 90C41 86 38 82 36 76Z" fill="' + HALDI_Y + '"/></g>' +
      '<g class="leaf-r" transform="translate(220 92)"><path d="M0 0C-24 12 -44 44 -44 90C-22 74 -4 40 0 0Z" fill="' + C.sal + '" stroke="' + C.kajal + '" stroke-width="3" stroke-linejoin="round"/><path d="M0 0C-24 12 -44 44 -44 90C-22 74 -4 40 0 0Z" fill="none" stroke="' + C.kagaz + '" stroke-width="1"/><path d="M0 0C-18 28 -34 58 -44 90" fill="none" stroke="' + C.kajal + '" stroke-width="1.6"/><path d="M-14 22 -24 20M-22 40 -34 40M-30 58 -40 60" stroke="' + C.kajal + '" stroke-width="1.2"/><path d="M-36 76C-40 82 -43 86 -44 90C-41 86 -38 82 -36 76Z" fill="' + HALDI_Y + '"/></g>',

    sangeet: (clip) =>
      '<g clip-path="url(#' + clip + ')">' + ['सा', 'रे', 'ग', 'म', 'प', 'ध', 'नि'].map((t, i) => { const x = 110 + i * 16.7; return '<text class="note" lang="hi" x="' + f(x) + '" y="' + (118 - (i % 3) * 14) + '" text-anchor="middle" font-family="Amita, \'Tiro Devanagari Hindi\', serif" font-weight="700" font-size="20" fill="' + (x < 160 ? C.zari : C.kajal) + '">' + t + '</text>'; }).join('') + '</g>' +
      '<g class="dholak">' +
      '<path d="M96 142C116 132 140 130 160 130V210C140 210 116 208 96 198Z" fill="' + C.mor + '"/>' +
      '<path d="M160 130C180 130 204 132 224 142V198C204 208 180 210 160 210Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M160 130C180 130 204 132 224 142V198C204 208 180 210 160 210Z" fill="none" stroke="' + C.kagaz + '" stroke-width="1"/>' +
      '<path d="M100 146 118 196 134 146 150 196" fill="none" stroke="' + C.zari + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M112 137V203M140 132V208" stroke="' + C.zari + '" stroke-width="3.2"/>' +
      '<path d="M170 146 186 196 202 146 218 196" fill="none" stroke="' + C.kajal + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M180 132V208M184 132V208M206 136V204M210 137V203" stroke="' + C.kajal + '" stroke-width="1.4"/>' +
      '<ellipse cx="94" cy="170" rx="10" ry="29" fill="' + C.chuna + '" stroke="' + C.zari + '" stroke-width="3"/>' +
      '<ellipse cx="226" cy="170" rx="10" ry="29" fill="' + C.kagaz + '" stroke="' + C.kajal + '" stroke-width="3"/></g>' +
      '<path d="M68 214C88 228 108 234 130 236" fill="none" stroke="' + C.zari + '" stroke-width="2"/>' +
      [[74, 219], [86, 226], [98, 231], [110, 234], [122, 235]].map(([x, y]) => '<g class="bell"><circle cx="' + x + '" cy="' + (y + 6) + '" r="5.2" fill="' + C.zari + '"/><path d="M' + (x - 3) + ' ' + (y + 8) + 'H' + (x + 3) + '" stroke="' + C.rani + '" stroke-width="1.2"/></g>').join('') +
      '<path d="M190 236C212 234 232 228 252 214" fill="none" stroke="' + C.kajal + '" stroke-width="2"/>' +
      [[198, 235], [210, 234], [222, 231], [234, 226], [246, 219]].map(([x, y]) => '<g class="bell"><circle cx="' + x + '" cy="' + (y + 6) + '" r="5.2" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.6"/><path d="M' + (x - 3) + ' ' + (y + 8) + 'H' + (x + 3) + '" stroke="' + C.kajal + '" stroke-width="1.2"/></g>').join(''),

    shaadi: (clip) => {
      const diyas = Array.from({ length: 7 }, (_, i) => {
        const a = (222 + i * 16) * Math.PI / 180, x = 160 + 106 * Math.cos(a), y = 160 + 106 * Math.sin(a), side = x < 158 ? 'l' : x > 162 ? 'r' : 'm';
        const her = '<path d="M-10 0C-10 7 0 7.5 0 7.5V0Z" fill="' + C.zari + '"/><path d="M0 0V7.5C0 7.5 10 7 10 0Z" fill="' + C.zari + '"/><path d="M-10 0H10" stroke="' + C.mor + '" stroke-width="1.6"/>';
        const his = '<path d="M-10 0C-10 7 10 7 10 0Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.6" stroke-linejoin="round"/>';
        const both = '<path d="M-10 0C-10 7 0 7.5 0 7.5V0Z" fill="' + C.zari + '"/><path d="M0 0V7.5C4 7.5 10 7 10 0Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.6" stroke-linejoin="round"/>';
        return '<g class="diya" transform="translate(' + f(x) + ' ' + f(y) + ')">' + (side === 'l' ? her : side === 'r' ? his : both) +
          '<g class="dflame"><path d="M0 -1C-4 -6 -2 -11 0 -14C2 -11 4 -6 0 -1Z" fill="' + HALDI_Y + '"/><path d="M0 -2C-1.6 -4.5 -1 -7 0 -8.5C1 -7 1.6 -4.5 0 -2Z" fill="' + C.sindoor + '"/></g></g>';
      }).join('');
      const kalash = (cx, his) => {
        const k = his ? ' stroke="' + C.kajal + '" stroke-width="2" stroke-linejoin="round"' : '';
        const leaf = (d) => '<path d="' + d + '" fill="' + C.sal + '"' + (his ? ' stroke="' + C.kajal + '" stroke-width="1.4" stroke-linejoin="round"' : '') + '/>';
        const belly = 'M-7 188C-28 194 -28 226 -12 234H12C28 226 28 194 7 188Z';
        return '<g transform="translate(' + cx + ' 0)">' +
          leaf('M0 178C-10 172 -20 170 -28 172C-20 178 -10 181 0 178Z') + leaf('M0 178C-6 168 -12 162 -20 158C-16 168 -8 176 0 178Z') +
          leaf('M0 178C6 168 12 162 20 158C16 168 8 176 0 178Z') + leaf('M0 178C10 172 20 170 28 172C20 178 10 181 0 178Z') +
          '<path d="M-4 160 0 151 4 160Z" fill="' + C.deep + '"/><ellipse cx="0" cy="168" rx="9" ry="11" fill="' + C.deep + '"' + k + '/>' +
          '<path d="M-9 180H9L7 188H-7Z" fill="' + (his ? C.haldi : C.zari) + '"' + k + '/>' +
          '<path d="' + belly + '" fill="' + (his ? C.haldi : C.zari) + '"' + k + '/>' +
          (his ? '<path d="' + belly + '" fill="none" stroke="' + C.kagaz + '" stroke-width=".9"/>' : '') +
          '<path d="M-10 234H10L7 240H-7Z" fill="' + (his ? C.haldi : C.zari) + '"' + k + '/>' +
          '<path d="M-14 178H14" stroke="' + (his ? C.kajal : C.zari) + '" stroke-width="4" stroke-linecap="round"/>' +
          (his
            ? '<path d="M-21 203H21V210H-21Z" fill="' + C.sindoor + '"/><path d="M-20 206.5H20" stroke="' + C.kajal + '" stroke-width="7" stroke-dasharray="1 3"/><path d="M-21 203H21M-21 210H21" stroke="' + C.kajal + '" stroke-width="1.4"/>' +
              [-12, -6, 0, 6, 12].map((x) => '<circle cx="' + x + '" cy="219" r="1.4" fill="' + C.kajal + '"/>').join('')
            : '<path d="M-21 203H21V210H-21Z" fill="' + C.mor + '"/>' + [-12, 0, 12].map((x) => '<path d="M' + x + ' 203.8 ' + (x + 2.8) + ' 206.5 ' + x + ' 209.2 ' + (x - 2.8) + ' 206.5Z" fill="' + C.rani + '"/>').join('') +
              '<path d="M-18 222H18" stroke="' + C.rani + '" stroke-width="1.4"/>') +
          '</g>';
      };
      const ticks = (x0, x1, y0, y1) => { let d = ''; for (let x = x0; x <= x1; x += 6) d += 'M' + x + ' ' + y0 + 'V' + y1; return d; };
      return diyas +
        '<g class="kalash-l">' + kalash(84, false) + '</g><g class="kalash-r">' + kalash(236, true) + '</g>' +
        '<g class="kund"><path d="M118 214H160V222H118ZM126 222H160V232H126ZM134 232H160V244H134Z" fill="' + C.zari + '"/><path d="M118 222H160M126 232H160" stroke="' + C.mor + '" stroke-width="1.6"/>' +
        '<path d="M160 214H202V222H160ZM160 222H194V232H160ZM160 232H186V244H160Z" fill="' + C.kagaz + '" stroke="' + C.kajal + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="' + ticks(166, 196, 216.5, 219.5) + ticks(166, 190, 224.5, 229.5) + ticks(166, 182, 234.5, 241.5) + '" stroke="' + C.kajal + '" stroke-width="1"/></g>' +
        '<path class="flame" d="M140 216C128 206 130 190 140 180C146 192 152 204 140 216Z" fill="' + HALDI_Y + '"/>' +
        '<path class="flame" d="M180 216C192 206 190 190 180 180C174 192 168 204 180 216Z" fill="' + HALDI_Y + '"/>' +
        '<path class="flame" d="M160 216C138 202 142 176 160 150C178 176 182 202 160 216Z" fill="#E27A1B"/>' +
        '<path class="flame" d="M160 214C148 204 150 186 160 170C170 186 172 204 160 214Z" fill="' + HALDI_Y + '"/>' +
        '<g clip-path="url(#' + clip + ')">' +
        '<g class="drape-l"><path d="M14 104Q82 150 150 110L151 124Q80 166 14 120Z" fill="' + C.zari + '"/><path d="M14 115Q80 160 150 119" fill="none" stroke="' + C.mor + '" stroke-width="2.4"/>' +
        [[47.7, 126.5], [81.6, 133], [116, 129]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="2" fill="' + C.rani + '"/>').join('') + '</g>' +
        '<g class="drape-r"><path d="M306 104Q238 150 170 110L169 124Q240 166 306 120Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M306 115Q240 160 170 119" fill="none" stroke="' + C.kajal + '" stroke-width="5" stroke-dasharray="1 2.6"/><path d="M306 108Q238 153 170 113" fill="none" stroke="' + C.kagaz + '" stroke-width=".9"/></g>' +
        '</g>' +
        '<g class="knot"><g transform="translate(160 112) scale(1.25) translate(-160 -112)"><path d="M156 120C152 132 150 142 147 150L154 152C156 142 158 132 161 122Z" fill="' + C.zari + '"/><circle cx="150.5" cy="153" r="2.6" fill="' + C.rani + '"/>' +
        '<path d="M164 120C168 132 170 142 173 150L166 152C164 142 162 132 159 122Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.4" stroke-linejoin="round"/><circle cx="169.5" cy="153" r="2.6" fill="' + C.sindoor + '" stroke="' + C.kajal + '" stroke-width="1"/>' +
        '<path d="M160 104C150 104 146 112 148 118C150 124 156 126 160 126Z" fill="' + C.zari + '"/><path d="M160 104C170 104 174 112 172 118C170 124 164 126 160 126Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M149 112C153 115 157 115 160 114" fill="none" stroke="' + C.mor + '" stroke-width="1.6"/><path d="M160 114C163 115 167 115 171 112" fill="none" stroke="' + C.kajal + '" stroke-width="1.6"/></g></g>';
    },

    blessing: () => {
      let rice = '';
      for (let r = 0, k = 0; r < 5; r++) {
        const n = 8 - r;
        for (let j = 0; j < n; j++, k++) {
          const x = 128 + (j - (n - 1) / 2) * 5.6 + ((k * 7) % 3) - 1, y = 206 - r * 4.4 + ((k * 5) % 3) - 1, rot = (k * 47) % 180;
          rice += '<ellipse class="rice" cx="' + f(x) + '" cy="' + f(y) + '" rx="1.8" ry="3.4" transform="rotate(' + rot + ' ' + f(x) + ' ' + f(y) + ')" fill="' + (k % 4 === 0 ? C.haldi : C.chuna) + '" stroke="' + C.kajal + '" stroke-width=".5"/>';
        }
      }
      return '<path d="M160 184A104 30 0 0 0 160 244Z" fill="' + C.zari + '"/><path d="M160 184A104 30 0 0 1 160 244Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="2.8"/>' +
        '<path d="M160 192A84 22 0 0 0 160 236" fill="none" stroke="' + C.rani + '" stroke-width="2.4"/><path d="M160 192A84 22 0 0 1 160 236" fill="none" stroke="' + C.kajal + '" stroke-width="1.4"/><path d="M160 196A78 18 0 0 1 160 232" fill="none" stroke="' + C.kajal + '" stroke-width="1.2"/>' +
        '<path d="M180 206H208A14 9 0 0 1 180 206Z" fill="' + C.kagaz + '" stroke="' + C.kajal + '" stroke-width="2"/><path d="M183 206C186 199 202 199 205 206Z" fill="' + C.sindoor + '"/>' +
        '<path d="M146 204C146 214 174 214 174 204Z" fill="' + C.zari + '" stroke="' + C.kajal + '" stroke-width="1.6"/>' +
        '<path class="flame" d="M160 202C152 192 156 182 160 174C164 182 168 192 160 202Z" fill="' + C.haldi + '"/><path class="flame" d="M160 201C156 195 158 189 160 184C162 189 164 195 160 201Z" fill="' + C.sindoor + '"/>' +
        rice;
    }
  };
  function eventArt(ev) {
    const clip = 'evclip' + (++clipUid);
    return '<svg viewBox="0 0 320 320" aria-hidden="true"><defs><clipPath id="' + clip + '"><circle cx="160" cy="160" r="133"/></clipPath></defs><g class="medal">' + frame() + '<g class="art">' + ART[ev](clip) + '</g></g></svg>';
  }

  /* chapter actions drawn as tokens: kumkum footprints ("show the way") and a tied knot ("tie a knot to remember") */
  function riteDisc() {
    return '<path d="M30 3A27 27 0 0 0 30 57Z" fill="' + C.rani + '"/><path d="M30 3A27 27 0 0 1 30 57Z" fill="' + C.kagaz + '"/>' +
      '<path d="M30 1.5A28.5 28.5 0 0 0 30 58.5" fill="none" stroke="' + C.zari + '" stroke-width="1.2"/><path d="M30 5.5A24.5 24.5 0 0 0 30 54.5" fill="none" stroke="' + C.zari + '" stroke-width="2.4"/>' +
      '<path d="M30 3.5A26.5 26.5 0 0 1 30 56.5" fill="none" stroke="' + C.kajal + '" stroke-width="2.4" stroke-dasharray=".8 1.8"/>' +
      '<path d="M30 1.5A28.5 28.5 0 0 1 30 58.5M30 5.5A24.5 24.5 0 0 1 30 54.5" fill="none" stroke="' + C.kajal + '" stroke-width="1.3"/>';
  }
  function foot(x, y, rot, mirror, fill, edge) {
    const st = edge ? ' stroke="' + edge + '" stroke-width=".8"' : '';
    return '<g class="step" transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')' + (mirror ? ' scale(-1 1)' : '') + '">' +
      '<path d="M0 -6.5C3.2 -6.5 4.1 -2.8 3.7 .8C3.3 4.6 2.4 7.4 0 7.4C-2.4 7.4 -3.1 3.8 -3.3 .8C-3.6 -2.8 -2.9 -6.5 0 -6.5Z" fill="' + fill + '"' + st + '/>' +
      [[-2.3, -8.9, 1.15], [-.6, -9.9, 1.2], [1.2, -9.7, 1.1], [2.7, -8.8, 1], [3.8, -7.3, .9]].map(([cx, cy, r]) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + st + '/>').join('') + '</g>';
  }
  function riteIcon(kind) {
    const art = kind === 'way'
      ? foot(22, 37, -10, true, C.zari) + foot(38.5, 24, 10, false, C.sindoor)
      : '<g class="tie"><path d="M7 33C13 29.5 19 28.5 25 30" fill="none" stroke="' + C.zari + '" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M53 33C47 29.5 41 28.5 35 30" fill="none" stroke="' + C.kajal + '" stroke-width="4.2" stroke-linecap="round"/><path d="M53 33C47 29.5 41 28.5 35 30" fill="none" stroke="' + C.sindoor + '" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M28.4 34.5 25.6 44" stroke="' + C.zari + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="25.2" cy="45.6" r="1.9" fill="' + C.haldi + '"/>' +
        '<path d="M31.6 34.5 34.4 44" stroke="' + C.kajal + '" stroke-width="4" stroke-linecap="round"/><path d="M31.6 34.5 34.4 44" stroke="' + C.haldi + '" stroke-width="1.8" stroke-linecap="round"/><circle cx="34.8" cy="45.6" r="1.9" fill="' + C.sindoor + '" stroke="' + C.kajal + '" stroke-width=".8"/>' +
        '<g class="knot-b"><path d="M30 24.5C26.2 24.5 24.4 27.4 24.8 30.2C25.2 33.1 27.4 35.2 30 35.2Z" fill="' + C.zari + '"/><path d="M30 24.5C33.8 24.5 35.6 27.4 35.2 30.2C34.8 33.1 32.6 35.2 30 35.2Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.3" stroke-linejoin="round"/>' +
        '<path d="M25.4 28.6C27 29.8 28.6 30 30 29.6" fill="none" stroke="' + C.mor + '" stroke-width="1"/><path d="M30 29.6C31.4 30 33 29.8 34.6 28.6" fill="none" stroke="' + C.kajal + '" stroke-width="1"/></g></g>';
    return '<svg viewBox="0 0 60 60" aria-hidden="true">' + riteDisc() + art + '</svg>';
  }

  /* loops: each plays only while its event is on screen */
  function haldiLoop(svg) {
    const master = gsap.timeline({ paused: true });
    const L = svg.querySelector('.leaf-l'), R = svg.querySelector('.leaf-r');
    gsap.set(svg.querySelectorAll('.splash'), { scale: 0, transformOrigin: '50% 50%' });
    const dip = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
      .to(L, { rotation: 8, y: '+=8', svgOrigin: '100 92', duration: 0.5, ease: 'power2.inOut' })
      .fromTo(svg.querySelectorAll('.sl'), { scale: 0, opacity: 1 }, { scale: 1.5, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power2.out' })
      .to(L, { rotation: 0, y: '-=8', svgOrigin: '100 92', duration: 0.55, ease: 'power2.inOut' }, '<')
      .to(R, { rotation: -8, y: '+=8', svgOrigin: '220 92', duration: 0.5, ease: 'power2.inOut' }, '+=0.2')
      .fromTo(svg.querySelectorAll('.sr'), { scale: 0, opacity: 1 }, { scale: 1.5, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power2.out' })
      .to(R, { rotation: 0, y: '-=8', svgOrigin: '220 92', duration: 0.55, ease: 'power2.inOut' }, '<');
    master.add(dip, 0);
    svg.querySelectorAll('.petal').forEach((p, i) => master.add(gsap.fromTo(p, { y: -150, x: 0, rotation: 0 }, { y: 200, x: rand(-26, 26), rotation: rand(140, 380), transformOrigin: '50% 50%', duration: rand(4.5, 7.5), ease: 'none', repeat: -1 }), (i % 5) * 0.8));
    return master;
  }
  function sangeetLoop(svg) {
    const master = gsap.timeline({ paused: true });
    const drum = svg.querySelector('.dholak'), bells = svg.querySelectorAll('.bell');
    gsap.set(bells, { transformOrigin: '50% 0%' });
    const beat = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
    [0, 0.3].forEach((t) => {
      beat.to(drum, { scaleX: 1.05, scaleY: 0.97, svgOrigin: '160 170', duration: 0.08, ease: 'power2.out' }, t)
        .to(drum, { scaleX: 1, scaleY: 1, svgOrigin: '160 170', duration: 0.24, ease: 'power3.out' }, t + 0.08)
        .to(bells, { rotation: (i) => (i % 2 ? 14 : -14), duration: 0.08, ease: 'power2.out', stagger: 0.012 }, t)
        .to(bells, { rotation: 0, duration: 0.4, ease: 'power3.out', stagger: 0.012 }, t + 0.1);
    });
    master.add(beat, 0);
    svg.querySelectorAll('.note').forEach((n, i) => master.add(gsap.fromTo(n, { y: 20, opacity: 0 }, { keyframes: { y: [20, -6, -34, -60], opacity: [0, 1, 1, 0] }, duration: 2.8, ease: 'none', repeat: -1 }), i * 0.4));
    return master;
  }
  function shaadiLoop(svg) {
    const master = gsap.timeline({ paused: true });
    svg.querySelectorAll('.flame').forEach((fl, i) => master.add(gsap.to(fl, { scaleY: rand(1.06, 1.14), scaleX: rand(0.92, 0.97), skewX: rand(-4, 4), transformOrigin: '50% 100%', duration: rand(0.18, 0.32), ease: 'sine.inOut', yoyo: true, repeat: -1 }), i * 0.05));
    svg.querySelectorAll('.dflame').forEach((fl, i) => master.add(gsap.to(fl, { scaleY: 1.18, transformOrigin: '50% 100%', duration: rand(0.25, 0.45), ease: 'sine.inOut', yoyo: true, repeat: -1 }), i * 0.07));
    master.add(gsap.fromTo(svg.querySelector('.knot'), { rotation: -2.5 }, { rotation: 2.5, svgOrigin: '160 106', duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }), 0);
    return master;
  }
  function blessingLoop(svg) {
    const master = gsap.timeline({ paused: true });
    svg.querySelectorAll('.flame').forEach((fl, i) => master.add(gsap.to(fl, { scaleY: 1.12, scaleX: 0.95, skewX: rand(-3, 3), transformOrigin: '50% 100%', duration: rand(0.2, 0.34), ease: 'sine.inOut', yoyo: true, repeat: -1 }), i * 0.06));
    return master;
  }
  function featherSvg(P) {
    return '<svg viewBox="0 0 40 120" aria-hidden="true">' +
      '<path d="M20 118C20 90 20 50 20 12" stroke="' + (P ? C.zari : C.kajal) + '" stroke-width="1.6" fill="none"/>' +
      '<path d="M20 14C4 30 4 72 20 104C36 72 36 30 20 14Z" fill="' + (P ? C.zari : C.haldi) + '" fill-opacity="' + (P ? 0.9 : 1) + '"' + (P ? '' : ' stroke="' + C.kajal + '" stroke-width="2.2"') + '/>' +
      (P ? '' : '<path d="M20 14C4 30 4 72 20 104C36 72 36 30 20 14Z" fill="none" stroke="' + C.kagaz + '" stroke-width=".8"/>') +
      '<path d="M20 50 10 42M20 62 9 56M20 74 11 70M20 50 30 42M20 62 31 56M20 74 29 70" stroke="' + (P ? C.rani : C.kajal) + '" stroke-width="1" fill="none" opacity=".7"/>' +
      '<ellipse cx="20" cy="34" rx="9" ry="12" fill="' + (P ? C.mor : C.neel) + '"' + (P ? '' : ' stroke="' + C.kajal + '" stroke-width="1.6"') + '/>' +
      '<ellipse cx="20" cy="35" rx="5" ry="7" fill="' + (P ? C.rani : C.sindoor) + '"/>' +
      '<circle cx="20" cy="36" r="2" fill="' + (P ? C.zari : C.haldi) + '"/></svg>';
  }
  function grainSvg(c) { return '<svg viewBox="0 0 10 20" aria-hidden="true"><ellipse cx="5" cy="10" rx="4" ry="8" fill="' + c + '"/></svg>'; }

  document.querySelectorAll('.med').forEach((el) => {
    if (el.dataset.event) { el.innerHTML = eventArt(el.dataset.event); return; }
    const pose = el.dataset.pose;
    const fanMode = pose === 'dance' ? 'open' : (el.dataset.fan === 'closed' ? 'closed' : 'none');
    el.innerHTML = medallion(pose, fanMode);
  });
  document.getElementById('meetSvg').innerHTML =
    beads([150, 94], [200, -6], [250, 94], 12, 4.6) +
    peacock('p', 'translate(85.6 44) scale(1.1)', 'closed') +
    peacock('m', 'translate(314.4 44) scale(-1.1 1.1)', 'closed');

  /* hero floaters: [x%, y%, width px, depth, kind]; depth > 1 sits in front of the names */
  const FLOAT = [
    [4, 14, 44, 0.5, 'p'], [88, 10, 40, 0.6, 'm'], [12, 58, 30, 0.35, 'g1'], [82, 52, 34, 0.9, 'p'],
    [2, 78, 56, 1.3, 'm'], [90, 80, 60, 1.4, 'p'], [30, 8, 22, 0.3, 'g2'], [66, 22, 22, 0.45, 'g1'],
    [48, 88, 26, 1.1, 'g2'], [22, 36, 36, 0.8, 'm'], [74, 70, 24, 0.7, 'g2'], [58, 4, 34, 0.55, 'p']
  ];
  const phoneWidth = matchMedia('(max-width: 599px)').matches;
  const flHtml = (list) => list.map(([x, y, w, d, k]) => {
    const inner = k === 'p' ? featherSvg(true) : k === 'm' ? featherSvg(false) : grainSvg(k === 'g1' ? C.zari : C.chuna);
    const wpx = k[0] === 'g' ? w * 0.35 : w;
    return '<span class="fl" data-depth="' + d + '" style="left:' + x + '%;top:' + y + '%;width:' + wpx + 'px;opacity:' + (d > 1 ? 0.95 : (0.55 + d * 0.3).toFixed(2)) + '">' + inner + '</span>';
  }).join('');
  const flList = FLOAT.slice(0, phoneWidth ? 7 : 12);
  document.getElementById('flBack').innerHTML = flHtml(flList.filter((it) => it[3] <= 1));
  document.getElementById('flFront').innerHTML = flHtml(flList.filter((it) => it[3] > 1));

  /* ribbons: text crossing in both scripts */
  const RIB_Z = ['शुभ विवाह', 'Shubh Vivah', 'पैठणी', 'Two souls, one celebration', 'शुभमंगल सावधान'];
  const RIB_M = ['मधुबनी', 'Madhubani meets Paithani', 'शुभ विवाह', 'From Pune to Ranchi', 'मंगल भवन'];
  const ribItems = (arr) => arr.map((t) => '<span class="item"' + (/[ऀ-ॿ]/.test(t) ? ' lang="hi"' : '') + '>' + t + '<span class="gem" aria-hidden="true"></span></span>').join('');
  document.getElementById('trackZ').innerHTML = ribItems(RIB_Z).repeat(2) + ribItems(RIB_Z).repeat(2);
  document.getElementById('trackM').innerHTML = ribItems(RIB_M).repeat(2) + ribItems(RIB_M).repeat(2);

  /* toran strands */
  document.getElementById('toran').innerHTML = Array.from({ length: phoneWidth ? 7 : 13 }, (_, i) =>
    '<span class="strand" style="--d:' + (4 + (i % 4) * 0.7).toFixed(1) + 's;--dl:-' + (i * 0.6).toFixed(1) + 's"><svg viewBox="0 0 22 88" aria-hidden="true">' +
    '<path d="M11 6V70" stroke="' + C.sal + '" stroke-width="1.2"/>' +
    [14, 28, 42, 56].map((y, j) => '<circle cx="11" cy="' + y + '" r="6.5" fill="' + ((i + j) % 2 ? C.sindoor : C.haldi) + '"/><circle cx="11" cy="' + y + '" r="2.4" fill="' + ((i + j) % 2 ? C.haldi : C.sindoor) + '"/>').join('') +
    '<path d="M11 66C4 72 5 82 11 87C17 82 18 72 11 66Z" fill="' + C.sal + '"/></svg></span>'
  ).join('');

  /* cover: a Madhubani toran (mango leaves, marigold strands, a mauli thread), zari buttis that twinkle, a Paithani pallu */
  const cvW = innerWidth;
  const nHang = Math.max(11, Math.min(41, Math.round(cvW / 34) | 1)), hc = (nHang - 1) / 2, maxF = phoneWidth ? 7 : 8;
  const leafSvg = '<svg width="22" height="56" viewBox="0 0 22 56" aria-hidden="true"><path d="M11 0V8" stroke="' + C.kajal + '" stroke-width="1"/>' +
    '<path d="M11 6C2 16 2 40 11 55C20 40 20 16 11 6Z" fill="' + C.sal + '" stroke="' + C.kajal + '" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M11 10.5C5.5 19 5.5 38 11 50C16.5 38 16.5 19 11 10.5Z" fill="none" stroke="' + C.kagaz + '" stroke-width=".8" opacity=".75"/>' +
    '<path d="M11 10V52M11 20 7.5 16.5M11 20 14.5 16.5M11 29 7 25M11 29 15 25M11 38 7.5 34.5M11 38 14.5 34.5" fill="none" stroke="' + C.kajal + '" stroke-width=".9"/></svg>';
  const strandSvg = (n, k) => {
    const ly = 14 + (n - 1) * 13 + 6;
    let g = '<path d="M11 0V' + ly + '" stroke="' + C.kajal + '" stroke-width=".9"/>';
    for (let j = 0; j < n; j++) {
      const y = 14 + j * 13;
      g += '<circle cx="11" cy="' + y + '" r="6.4" fill="' + ((j + k) % 2 ? '#E27A1B' : C.haldi) + '" stroke="' + C.kajal + '" stroke-width=".9"/>' +
        '<circle cx="11" cy="' + y + '" r="3.4" fill="none" stroke="' + C.kajal + '" stroke-width=".7" stroke-dasharray="1.1 1.1"/><circle cx="11" cy="' + y + '" r="1.5" fill="' + C.sindoor + '"/>';
    }
    g += n >= 5
      ? '<path d="M11 ' + ly + 'C6 ' + (ly + 2) + ' 5 ' + (ly + 8) + ' 4 ' + (ly + 13) + 'H18C17 ' + (ly + 8) + ' 16 ' + (ly + 2) + ' 11 ' + ly + 'Z" fill="' + C.zari + '" stroke="' + C.kajal + '" stroke-width=".9"/><circle cx="11" cy="' + (ly + 15) + '" r="1.9" fill="' + C.kajal + '"/>'
      : '<path d="M11 ' + ly + 'C5 ' + (ly + 6) + ' 6 ' + (ly + 14) + ' 11 ' + (ly + 18) + 'C16 ' + (ly + 14) + ' 17 ' + (ly + 6) + ' 11 ' + ly + 'Z" fill="' + C.sal + '" stroke="' + C.kajal + '" stroke-width="1"/>';
    return '<svg width="22" height="' + (ly + 19) + '" viewBox="0 0 22 ' + (ly + 19) + '" aria-hidden="true">' + g + '</svg>';
  };
  document.getElementById('cvToran').innerHTML = Array.from({ length: nHang }, (_, i) => {
    const off = Math.abs(i - hc);
    const inner = off % 2 ? strandSvg(2 + Math.round((maxF - 2) * Math.pow(off / hc, 2.6)), i) : leafSvg;
    return '<span class="hang" style="--d:' + (4.2 + (i % 5) * 0.55).toFixed(2) + 's;--dl:-' + ((i * 0.73) % 4).toFixed(2) + 's">' + inner + '</span>';
  }).join('');
  const twCols = Math.floor(cvW / 26), twRows = Math.floor(innerHeight / 26);
  document.getElementById('cvTw').innerHTML = Array.from({ length: phoneWidth ? 12 : 22 }, () =>
    '<span class="tw" style="left:' + 26 * (1 + Math.floor(Math.random() * (twCols - 1))) + 'px;top:' + 26 * (2 + Math.floor(Math.random() * (twRows - 3))) + 'px;--d:' + rand(4, 7).toFixed(2) + 's;--dl:-' + rand(0, 7).toFixed(2) + 's">' +
    '<svg viewBox="0 0 12 12"><path d="M6 0 7 5 12 6 7 7 6 12 5 7 0 6 5 5Z" fill="#F2D98C"/></svg></span>').join('');
  const pk = (tx, sx) => '<g transform="translate(' + tx + ' -2.8) scale(' + sx + ' .28)"><path d="' + TAIL + '" fill="' + C.mor + '"/>' +
    '<circle cx="16" cy="142" r="5.5" fill="' + C.rani + '"/><circle cx="16" cy="142" r="2.2" fill="#F2D98C"/><circle cx="30" cy="149" r="5" fill="' + C.rani + '"/><circle cx="30" cy="149" r="2" fill="#F2D98C"/>' +
    '<path d="' + BODY + '" fill="' + C.mor + '"/><ellipse cx="58" cy="104" rx="17" ry="11" fill="' + C.rani + '"/><path d="' + BEAK + '" fill="' + C.kajal + '"/>' +
    '<path d="' + CREST + '" stroke="' + C.mor + '" stroke-width="3.2" stroke-linecap="round"/><circle cx="80" cy="30" r="3.4" fill="' + C.rani + '"/><circle cx="88" cy="28" r="3.4" fill="' + C.rani + '"/><circle cx="96" cy="30" r="3.4" fill="' + C.rani + '"/>' +
    '<circle cx="87" cy="47" r="3" fill="' + C.chuna + '"/><path d="' + LEGS + '" stroke="' + C.kajal + '" stroke-width="3.4" stroke-linecap="round"/></g>';
  const lotus = ['M60 38C54 31 55 20 60 11C65 20 66 31 60 38Z', 'M60 38C52 37 47 30 48 22C54 24 58 30 60 38Z', 'M60 38C68 37 73 30 72 22C66 24 62 30 60 38Z']
    .map((d) => '<path d="' + d + '" fill="' + C.rani + '" stroke="' + C.mor + '" stroke-width=".9"/>').join('') + '<path d="M50 40.5H70" stroke="' + C.mor + '" stroke-width="1.6" stroke-linecap="round"/>';
  const palluSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="46" viewBox="0 0 120 46"><path d="M0 2.5H120M0 43.5H120" stroke="' + C.mor + '" stroke-width="1.2" stroke-dasharray="2 2"/>' +
    pk(14, 0.28) + lotus + pk(106, -0.28) + '</svg>';
  document.getElementById('cvPallu').style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(palluSvg) + '")';

  /* gold specks */
  document.getElementById('specks').innerHTML = Array.from({ length: 16 }, (_, i) =>
    '<span class="speck" style="left:' + ((i * 37) % 96 + 2) + '%;top:' + ((i * 53) % 88 + 6) + '%"></span>').join('');

  /* verse */
  const verse = [
    'गङ्गा सिन्धु सरस्वती च यमुना गोदावरी नर्मदा',
    'कावेरी सरयू महेन्द्रतनया चर्मण्वती वेदिका।',
    'शिप्रा वेत्रवती महासुरनदी ख्याता च या गण्डकी',
    'पूर्णाः पुण्यजलैः समुद्रसहिताः कुर्वन्तु वो मङ्गलम्॥'
  ];
  document.getElementById('verse').innerHTML = verse.map((line) =>
    '<span class="ln">' + line.split(' ').map((w) => '<span class="vw' + (w === 'गोदावरी' || w === 'गण्डकी' ? ' river' : '') + '">' + w + '</span>').join('') + '</span>'
  ).join('');

  /* split Latin text into letters (never Devanagari) */
  document.querySelectorAll('.letters').forEach((el) => {
    const text = el.textContent;
    if (!el.hasAttribute('aria-hidden')) el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map((w) => '<span class="word" aria-hidden="true">' + w.split('').map((c) => '<span class="ch">' + c + '</span>').join('') + '</span>').join(' ');
  });

  /* countdown with seconds */
  const target = Date.UTC(2026, 11, 9, 14, 30);
  const cdEls = ['d', 'h', 'm', 's'].map((k) => document.getElementById('cd-' + k));
  let cdVisible = true, lastVals = [];
  function tick(animate) {
    const ms = Math.max(0, target - Date.now());
    const vals = [String(Math.floor(ms / 86400000)), String(Math.floor((ms % 86400000) / 3600000)).padStart(2, '0'), String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0'), String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')];
    vals.forEach((v, i) => {
      if (v === lastVals[i]) return;
      cdEls[i].textContent = v;
      if (animate && window.gsap && !reduce) gsap.fromTo(cdEls[i], { yPercent: -45, opacity: 0.4 }, { yPercent: 0, opacity: 1, duration: 0.38, ease: 'power2.out' });
    });
    lastVals = vals;
  }

  const counts = { haldi: 2, sangeet: 2, shaadi: 2 };
  const total = () => counts.haldi + counts.sangeet + counts.shaadi;
  document.querySelectorAll('.step button').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k;
    counts[k] = Math.max(0, Math.min(20, counts[k] + Number(b.dataset.d)));
    const out = document.getElementById('n-' + k);
    out.textContent = counts[k];
    document.getElementById('total').textContent = total();
    if (window.gsap && !reduce) gsap.fromTo(out, { yPercent: Number(b.dataset.d) > 0 ? 40 : -40, opacity: 0.3 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
  }));

  const hasGsap = !!window.gsap && !!window.ScrollTrigger;
  let forceMotion = false;
  try { forceMotion = sessionStorage.getItem('sm-force-motion') === '1'; } catch (e) { /* storage blocked */ }
  const osReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduce = osReduce && !forceMotion;
  const fine = matchMedia('(pointer: fine)').matches;
  const root = document.documentElement;
  const cover = document.getElementById('cover');
  tick(false);
  setInterval(() => { if (cdVisible) tick(true); }, 1000);
  root.classList.add('locked');
  document.getElementById('openBtn').focus({ preventScroll: true });

  let lenis = null;
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (!reduce && fine && window.Lenis) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
    }
  }

  function burst(n, petals) {
    if (!hasGsap || reduce) return;
    const layer = document.getElementById('akshata');
    const W = innerWidth, H = innerHeight;
    for (let i = 0; i < n; i++) {
      const g = document.createElement('i');
      const petal = petals && i % 3 === 2;
      g.className = petal ? 'grain petal' : 'grain';
      g.style.left = (W * (0.12 + Math.random() * 0.76)) + 'px';
      g.style.top = '-14px';
      g.style.background = petal ? (i % 2 ? '#E27A1B' : C.haldi) : [C.zari, C.chuna, C.haldi][i % 3];
      layer.appendChild(g);
      gsap.fromTo(g, { y: 0, rotation: Math.random() * 180 }, {
        y: H * (0.35 + Math.random() * 0.55), x: (Math.random() - 0.5) * 90, rotation: '+=' + (200 + Math.random() * 300),
        duration: 1.5 + Math.random() * 0.8, ease: 'power1.in', onComplete: () => g.remove()
      });
      gsap.to(g, { autoAlpha: 0, duration: 0.5, delay: 1.2 + Math.random() * 0.7 });
    }
  }

  /* moments guide */
  const moments = document.getElementById('moments'), momBtn = document.getElementById('momBtn'), momList = document.getElementById('momList');
  /* prototype: say whether motion is running, and why not */
  const mStat = document.getElementById('mStat');
  const setForce = (on) => { try { on ? sessionStorage.setItem('sm-force-motion', '1') : sessionStorage.removeItem('sm-force-motion'); } catch (e) { /* storage blocked */ } location.reload(); };
  if (!hasGsap) {
    mStat.textContent = "Motion is off: the animation library didn't load. Pull down to refresh the page.";
  } else if (osReduce && !forceMotion) {
    mStat.innerHTML = "Motion is off because your phone's <b>Reduce Motion</b> setting is on, so the page stays still (guests with that setting will see it this way too).<br><button type=\"button\">Play the motion anyway</button>";
    mStat.querySelector('button').addEventListener('click', () => setForce(true));
  } else if (forceMotion) {
    mStat.innerHTML = "Motion is on for this preview, even though your phone's Reduce Motion is on.<br><button type=\"button\">Back to still</button>";
    mStat.querySelector('button').addEventListener('click', () => setForce(false));
  } else {
    mStat.textContent = 'Motion is on.';
  }
  if (!hasGsap || reduce) momBtn.lastChild.textContent = 'Moments · motion off';

  momBtn.addEventListener('click', () => {
    const open = momList.hidden;
    momList.hidden = !open;
    momBtn.setAttribute('aria-expanded', String(open));
  });
  momList.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    momList.hidden = true;
    momBtn.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.scrollTo(t, { duration: 1.4 });
    else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  let heroIntro = null;
  function unlock() {
    root.classList.remove('locked');
    cover.remove();
    moments.hidden = false;
    if (lenis) lenis.start();
    if (hasGsap) ScrollTrigger.refresh();
    if (heroIntro) heroIntro.play();
    const h = document.getElementById('heroTitle');
    if (h) h.focus({ preventScroll: true });
  }
  /* cover: entrance, the seal's dha-dha heartbeat, the antarpat's tug, and the opening */
  const seal = document.getElementById('openBtn');
  let cvIntro = null, pulse = null, nudgeCall = null, nudges = 0, opened = false;
  function sealPulse() {
    const wrap = seal.parentNode, rings = wrap.querySelectorAll('.ring'), halo = wrap.querySelector('.halo'), gap = 28;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.3 });
    [0, 0.3].forEach((t, i) => {
      tl.to(seal, { scale: i ? 1.03 : 1.05, duration: 0.12, ease: 'power2.out' }, t)
        .to(seal, { scale: 1, duration: 0.24, ease: 'power2.in' }, t + 0.12)
        .to(halo, { opacity: i ? 0.75 : 1, scale: i ? 1.04 : 1.08, duration: 0.12, ease: 'power2.out' }, t)
        .to(halo, { opacity: 0.35, scale: 1, duration: 0.6, ease: 'power2.inOut' }, t + 0.12)
        .fromTo(rings[i], { scaleX: 1, scaleY: 1, opacity: 0.95 }, { scaleX: () => 1 + (2 * gap) / wrap.offsetWidth, scaleY: () => 1 + (2 * gap) / wrap.offsetHeight, opacity: 0, duration: 1.2, ease: 'power2.out' }, t);
    });
    return tl.fromTo(seal.querySelector('.glint'), { xPercent: -120 }, { xPercent: 120, duration: 0.9, ease: 'power2.inOut' }, 0.75);
  }
  function tug() {
    if (opened) return;
    gsap.timeline()
      .to('#cover .cloth', { y: 14, duration: 0.22, ease: 'power2.in' })
      .to('#cover .cloth', { y: 0, duration: 1.2, ease: 'elastic.out(1, 0.35)' })
      .to('#cvToran .hang', { rotation: (i) => (i % 2 ? 7 : -7), duration: 0.2, ease: 'power2.out' }, 0)
      .to('#cvToran .hang', { rotation: 0, duration: 1.5, ease: 'elastic.out(1, 0.3)' }, 0.2);
    burst(6);
    if (++nudges < 3) nudgeCall = gsap.delayedCall(6.5, tug);
  }
  if (hasGsap && !reduce) {
    const nameIn = { clipPath: 'inset(-30% 100% -30% -12%)' }, nameOut = { clipPath: 'inset(-30% -12% -30% -12%)', ease: 'power2.inOut', duration: 0.9 };
    cvIntro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onComplete: () => { if (opened) return; pulse = sealPulse(); nudgeCall = gsap.delayedCall(3, tug); } })
      .from('#cvToran .hang', { yPercent: -115, duration: 0.9, ease: 'back.out(1.4)', stagger: { each: 0.04, from: 'center' } }, 0)
      .from('#cover .cv-guest', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.2)
      .fromTo('#cover .cv-door', { '--arch': 0 }, { '--arch': 1, duration: 1.1, ease: 'power2.inOut' }, 0.25)
      .from('#cover .cv-apex', { scale: 0, rotation: -90, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(3)' }, 1.3)
      .from('#cover .cv-inv', { autoAlpha: 0, duration: 0.5 }, 0.35)
      .from('#cover .sw-disc', { scale: 0.4, autoAlpha: 0, svgOrigin: '50 50', duration: 0.6, ease: 'back.out(1.8)' }, 0.4)
      .from('#cover .sw-hatch', { autoAlpha: 0, duration: 0.4 }, 0.8)
      .fromTo('#cover .sw-ring', { strokeDasharray: '1 2', strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, duration: 0.7, ease: 'power2.inOut' }, 0.45)
      .from('#cover .cv-rule', { scaleX: 0, duration: 0.7, ease: 'power2.inOut' }, 0.55)
      .fromTo('#cover .sw-line', { strokeDasharray: '1 2', strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, autoRound: false, duration: 0.24, ease: 'power1.inOut', stagger: 0.2 }, 0.75)
      .from('#cover .sw-dot', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)', stagger: 0.08 }, 1.95)
      .fromTo('#cover .cv-nm', { ...nameIn }, { ...nameOut, stagger: 0.3 }, 0.8)
      .from('#cover .cv-amp', { scale: 0, autoAlpha: 0, duration: 0.4, ease: 'back.out(2)' }, 1.15)
      .fromTo('#cover .cv-dn', { ...nameIn }, { ...nameOut }, 1.4)
      .from('#cover .cv-date', { y: 10, autoAlpha: 0, duration: 0.5 }, 1.7)
      .from('#cover .cv-cta', { y: 26, autoAlpha: 0, duration: 0.7 }, 1.75);
    const fontsOk = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
    fontsOk.then(() => { if (!opened) cvIntro.play(); });
  }
  cover.classList.add('ready');

  function openCover() {
    if (opened) return;
    opened = true;
    try { if (navigator.vibrate) navigator.vibrate([14, 70, 20]); } catch (e) { /* no haptics */ }
    if (!hasGsap || reduce) { unlock(); return; }
    if (cvIntro) cvIntro.progress(1, true).kill();
    if (pulse) pulse.kill();
    if (nudgeCall) nudgeCall.kill();
    gsap.killTweensOf('#cover .cloth, #cvToran .hang');
    gsap.timeline({ onComplete: unlock })
      .to(seal, { scale: 0.95, duration: 0.09, ease: 'power2.out' })
      .to(seal, { scale: 1.07, duration: 0.22, ease: 'back.out(3)' })
      .fromTo(seal.parentNode.querySelectorAll('.ring'), { scaleX: 1, scaleY: 1, opacity: 1 }, { scaleX: 1.3, scaleY: 1.9, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1 }, 0.09)
      .to(seal.parentNode.querySelector('.halo'), { opacity: 1, scale: 1.3, duration: 0.3, ease: 'power2.out' }, 0.09)
      .fromTo(seal.querySelector('.glint'), { xPercent: -120 }, { xPercent: 120, duration: 0.5, ease: 'power2.inOut' }, 0.09)
      .to('#cvToran .hang', { rotation: (i) => (i % 2 ? 12 : -12), duration: 0.3, ease: 'power2.out' }, 0.1)
      .to('#cover .cv-text', { y: -18, autoAlpha: 0, duration: 0.35, ease: 'power2.in', stagger: 0.05 }, 0.3)
      .to('#cover .cloth', { yPercent: 104, y: 0, duration: 0.95, ease: 'power2.in' }, 0.5)
      .add(() => burst(36, true), 0.85)
      .add(() => { if (heroIntro) heroIntro.play(); }, 1.05)
      .to('#cvToran', { yPercent: -130, scale: 1.12, autoAlpha: 0, transformOrigin: '50% 0%', duration: 0.6, ease: 'power2.in' }, 1.0);
  }
  seal.addEventListener('click', openCover);
  cover.querySelector('.cloth').addEventListener('click', (e) => { if (!seal.contains(e.target)) openCover(); });

  document.getElementById('rsvpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('total2').textContent = total();
    const form = e.currentTarget, thanks = document.getElementById('thanks');
    const svg = document.querySelector('#rsvp .med svg');
    const finish = () => { form.hidden = true; thanks.hidden = false; };
    if (!hasGsap || reduce) { finish(); return; }
    gsap.timeline()
      .to(form, { autoAlpha: 0, y: -12, duration: 0.3, ease: 'power2.in', onComplete: finish })
      .to(svg.querySelectorAll('.rice'), { y: () => '-=' + rand(60, 120).toFixed(1), x: () => '+=' + rand(-60, 60).toFixed(1), rotation: () => '+=' + rand(-200, 200).toFixed(0), opacity: 0, duration: 1.1, ease: 'power2.out', stagger: 0.012 }, 0.1)
      .add(() => burst(26), 0.25)
      .from(thanks, { autoAlpha: 0, y: 16, duration: 0.6, ease: 'power3.out' }, 0.45);
  });

  /* chapter actions: kumkum footprints open Maps; the knot saves the date (.ics, or Google Calendar on Android) */
  document.querySelectorAll('.rite').forEach((r) => { r.querySelector('.rite-ic').innerHTML = riteIcon(r.dataset.rite); });
  const CAL = {
    haldi: { name: 'Haldi', s: '20261208T063000Z', e: '20261208T093000Z', note: 'Wear yellow, in turmeric shades.' },
    sangeet: { name: 'Sangeet', s: '20261208T143000Z', e: '20261208T180000Z', note: 'Evening formals; Indo-western welcome.' },
    shaadi: { name: 'Shaadi', s: '20261209T143000Z', e: '20261209T183000Z', note: 'Traditional finery, in jewel tones.' }
  };
  const icsText = (t) => t.replace(/[\\,;]/g, (m) => '\\' + m);
  const calTitle = (key) => CAL[key].name + ' · Shreyansh & Mrunalini', calWhere = 'Haveli Banquet, Ranchi';
  const gcal = (key) => 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(calTitle(key)) + '&dates=' + CAL[key].s + '/' + CAL[key].e + '&location=' + encodeURIComponent(calWhere) + '&details=' + encodeURIComponent(CAL[key].note) + '&ctz=Asia/Kolkata';
  /* an .ics file for Apple Calendar on the live site; inside the Claude viewer (window.claude) and on Android the link goes to Google Calendar */
  const useIcs = () => !window.claude && !/android/i.test(navigator.userAgent);
  function downloadIcs(key) {
    const ev = CAL[key], title = calTitle(key), where = calWhere;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Shreyansh and Mrunalini//Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:' + key + '-2026@shreyansh-mrunalini', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''),
      'DTSTART:' + ev.s, 'DTEND:' + ev.e, 'SUMMARY:' + icsText(title), 'LOCATION:' + icsText(where), 'DESCRIPTION:' + icsText(ev.note),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText('Tomorrow: ' + title), 'TRIGGER:-P1D', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = key + '-shreyansh-mrunalini.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  const walk = (r) => { if (window.gsap && !reduce) gsap.fromTo(r.querySelectorAll('.step'), { opacity: 0.15 }, { opacity: 1, duration: 0.28, stagger: 0.2, ease: 'power2.out' }); };
  document.querySelectorAll('.rite[data-rite="way"]').forEach((r) => {
    r.addEventListener('pointerenter', () => walk(r));
    r.addEventListener('click', () => walk(r));
  });
  document.querySelectorAll('.rite[data-rite="knot"]').forEach((r) => { r.href = gcal(r.dataset.cal); });
  document.querySelectorAll('.rite[data-rite="knot"]').forEach((r) => r.addEventListener('click', (e) => {
    if (useIcs()) { e.preventDefault(); downloadIcs(r.dataset.cal); }
    const note = r.querySelector('i');
    note.textContent = 'Opening your calendar…';
    setTimeout(() => { note.textContent = 'Save the date'; }, 2600);
    if (!window.gsap || reduce) return;
    gsap.fromTo(r.querySelector('.knot-b'), { scale: 1.45 }, { scale: 1, svgOrigin: '30 30', duration: 0.6, ease: 'back.out(3)' });
    gsap.fromTo(r.querySelector('.tie'), { rotation: -10 }, { rotation: 0, svgOrigin: '30 30', duration: 0.9, ease: 'elastic.out(1, 0.4)' });
  }));

  if (!hasGsap) return;

  /* hover wave on Latin letters (desktop pointer or tap) */
  document.querySelectorAll('.wave').forEach((el) => {
    const run = () => {
      if (reduce || gsap.isTweening(el.querySelectorAll('.ch'))) return;
      gsap.to(el.querySelectorAll('.ch'), { y: -8, rotation: -4, duration: 0.22, ease: 'sine.out', stagger: 0.035, yoyo: true, repeat: 1 });
    };
    el.addEventListener('pointerenter', run);
    el.addEventListener('click', run);
  });

  const mm = gsap.matchMedia();
  mm.add({ phone: '(max-width: 599px)', desk: '(min-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    const { phone, desk } = ctx.conditions;
    const rm = ctx.conditions.reduce && !forceMotion;
    if (rm) {
      gsap.set('#meetSvg .tail', { autoAlpha: 0 });
      gsap.set('#mL, #mR', { xPercent: 0 });
      gsap.set('#meeting .cap', { autoAlpha: 0 });
      gsap.set('#meeting .cap:last-child', { autoAlpha: 1 });
      return;
    }

    const cleanups = [];

    /* progress thread in the zari selvedge */
    gsap.to('#progress', { scaleY: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    /* hero intro: halves, medallion, letter-by-letter names, calligraphic write-in for Devanagari */
    const blur = desk && fine;
    heroIntro = gsap.timeline({ paused: root.classList.contains('locked'), defaults: { ease: 'power3.out' } })
      .from('#hero .half.l', { xPercent: -100, duration: 0.9 })
      .from('#hero .half.r', { xPercent: 100, duration: 0.9 }, '<')
      .from('#hero .med svg', { scale: 0.9, autoAlpha: 0, duration: 0.8, transformOrigin: '50% 50%' }, '-=0.5')
      .from('#hero .pk-l', { x: -40, duration: 1 }, '<0.1')
      .from('#hero .pk-r', { x: 40, duration: 1 }, '<0.08')
      .fromTo('#hero .letters .ch', Object.assign({ yPercent: 70, rotationX: -50, transformPerspective: 400, autoAlpha: 0 }, blur ? { filter: 'blur(8px)' } : {}), Object.assign({ yPercent: 0, rotationX: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.045 }, blur ? { filter: 'blur(0px)' } : {}), '-=0.7')
      .from('#hero .amp', { scale: 0, autoAlpha: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.5')
      .from('#hero .write', { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.1, ease: 'power2.inOut', stagger: 0.12 }, '-=0.4')
      .from('#hero .hero-date', { y: 12, autoAlpha: 0, duration: 0.6 }, '-=0.6')
      .from('#hero .fl', { autoAlpha: 0, duration: 1.2, stagger: 0.06 }, 0.3);
    if (!cover.isConnected) heroIntro.play();

    /* floaters: ambient drift + scroll parallax by depth + pointer depth on desktop */
    const floaters = gsap.utils.toArray('#hero .fl');
    const drift = floaters.map((el, i) => gsap.to(el.firstChild, { y: rand(-14, 14), x: rand(-8, 8), rotation: rand(-12, 12), duration: rand(3, 6), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.2, paused: true }));
    const crest = gsap.to('#hero .crest', { y: -1.6, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.5, paused: true });
    ScrollTrigger.create({ trigger: '#hero', start: 'top bottom', end: 'bottom top', onToggle: (s) => [...drift, crest].forEach((t) => (s.isActive ? t.play() : t.pause())) });
    floaters.forEach((el) => {
      const d = Number(el.dataset.depth);
      gsap.to(el, { y: () => -innerHeight * 0.35 * d, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
    gsap.to('#hero .med', { y: () => innerHeight * 0.08, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (fine) {
      const hero = document.getElementById('hero');
      const movers = floaters.map((el) => ({ d: Number(el.dataset.depth), x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }) }));
      const medX = gsap.quickTo('#hero .med svg', 'x', { duration: 1, ease: 'power3.out' });
      const onMove = (e) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        movers.forEach((m) => m.x(nx * 60 * m.d));
        medX(nx * -10);
      };
      hero.addEventListener('pointermove', onMove);
      cleanups.push(() => hero.removeEventListener('pointermove', onMove));
      const seal = document.getElementById('openBtn');
      if (seal.isConnected) {
        const sx = gsap.quickTo(seal, 'x', { duration: 0.45, ease: 'power3.out' }), sy = gsap.quickTo(seal, 'y', { duration: 0.45, ease: 'power3.out' });
        seal.addEventListener('pointermove', (e) => { const r = seal.getBoundingClientRect(); sx((e.clientX - r.left - r.width / 2) * 0.18); sy((e.clientY - r.top - r.height / 2) * 0.18); });
        seal.addEventListener('pointerleave', () => { sx(0); sy(0); });
      }
    }

    /* crossing ribbons: drift, and race with scroll speed */
    const tracks = [{ el: document.getElementById('trackZ'), dir: -1, p: 0 }, { el: document.getElementById('trackM'), dir: 1, p: -25 }];
    let boost = 0, sdir = 1, ribOn = false;
    ScrollTrigger.create({ trigger: '#ribbons', start: 'top bottom', end: 'bottom top', onToggle: (s) => (ribOn = s.isActive), onUpdate: (s) => { boost = Math.min(Math.abs(s.getVelocity()) / 220, 9); sdir = s.direction; } });
    const ribTick = (time, dt) => {
      if (!ribOn) return;
      boost *= 0.93;
      const step = (0.03 + boost * 0.06) * sdir * (dt / 16.67);
      tracks.forEach((t) => { t.p = (((t.p + step * t.dir) % 50) - 50) % 50; t.el.style.transform = 'translateX(' + t.p.toFixed(3) + '%)'; });
    };
    gsap.ticker.add(ribTick);
    cleanups.push(() => gsap.ticker.remove(ribTick));
    gsap.fromTo('.rib-z', { rotation: -8 }, { rotation: -3, ease: 'none', scrollTrigger: { trigger: '#ribbons', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.rib-m', { rotation: 8 }, { rotation: 3, ease: 'none', scrollTrigger: { trigger: '#ribbons', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* the meeting: pinned and scrubbed */
    gsap.set('#meetSvg .f-line', { strokeDasharray: 1 });
    gsap.set('#meeting .cap', { autoAlpha: 0 });
    gsap.set('#meeting .cap:first-child', { autoAlpha: 1 });
    const caps = gsap.utils.toArray('#meeting .cap');
    const meet = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#meeting', start: 'top top', end: () => '+=' + Math.round(innerHeight * (phone ? 1.5 : 2.1)),
        pin: '#meeting .stage', scrub: fine ? 1.2 : 0.5, anticipatePin: 1, invalidateOnRefresh: true,
        onLeave: () => burst(26)
      }
    });
    meet.fromTo('#mL', { xPercent: -60 }, { xPercent: 0, duration: 0.35 }, 0)
      .fromTo('#mR', { xPercent: 60 }, { xPercent: 0, duration: 0.35 }, 0)
      .fromTo('#meetSvg .pk-l', { x: -110 }, { x: -24, duration: 0.35 }, 0)
      .fromTo('#meetSvg .pk-r', { x: 110 }, { x: 24, duration: 0.35 }, 0)
      .to('#meetSvg .pk', { keyframes: { y: [0, -4, 0, -4, 0] }, duration: 0.35 }, 0)
      .to(caps[0], { autoAlpha: 0, duration: 0.04 }, 0.18)
      .to(caps[1], { autoAlpha: 1, duration: 0.04 }, 0.2)
      .to('#meetSvg .tail', { autoAlpha: 0, duration: 0.08 }, 0.38)
      .fromTo('#meetSvg .f-line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, duration: 0.14, stagger: 0.012 }, 0.36)
      .fromTo('#meetSvg .f-eye, #meetSvg .f-in', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.1, stagger: 0.006 }, 0.42)
      .to(caps[1], { autoAlpha: 0, duration: 0.04 }, 0.37)
      .to(caps[2], { autoAlpha: 1, duration: 0.04 }, 0.39)
      .to('#meetSvg .pk-l', { x: 0, duration: 0.15 }, 0.7)
      .to('#meetSvg .pk-r', { x: 0, duration: 0.15 }, 0.7)
      .fromTo('#meetSvg .bead', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.08, stagger: 0.008 }, 0.76)
      .to(caps[2], { autoAlpha: 0, duration: 0.04 }, 0.72)
      .to(caps[3], { autoAlpha: 1, duration: 0.04 }, 0.74)
      .fromTo('#meeting .write', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.14, stagger: 0.03 }, 0.86);

    /* schedule: head reveals, chapters draw themselves, focus band on narrow screens, hover lift on desktop */
    gsap.utils.toArray('#schedule .sched-head .reveal').forEach((el, i) => gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.85, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: '#schedule', start: 'top 80%', once: true } }));
    gsap.from('#toran .strand', { yPercent: -100, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.4)', stagger: 0.05, scrollTrigger: { trigger: '#schedule', start: 'top 85%', once: true } });

    gsap.utils.toArray('.chapter').forEach((ch) => {
      const svg = ch.querySelector('.med svg'), ev = ch.dataset.event;
      const rings = svg.querySelectorAll('.ring-draw');
      gsap.set(rings, { strokeDasharray: 1 });
      const loop = ev === 'haldi' ? haldiLoop(svg) : ev === 'sangeet' ? sangeetLoop(svg) : shaadiLoop(svg);
      let ready = false, vis = false;
      const tl = gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 80%', once: true }, defaults: { ease: 'power3.out' }, onComplete: () => { ready = true; if (vis) loop.play(); } });
      tl.fromTo(rings, { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, duration: 1.1, ease: 'power2.inOut', stagger: 0.06 })
        .from(svg.querySelectorAll('.disc, .ring-m'), { autoAlpha: 0, duration: 0.6 }, 0.1)
        .from(svg.querySelector('.art'), { scale: 0.86, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.8 }, 0.35)
        .from(ch.querySelectorAll('h3 .ch'), { yPercent: 70, rotationX: -50, transformPerspective: 400, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.05 }, 0.5);
      if (ev === 'haldi') tl.from(svg.querySelectorAll('.leaf-l, .leaf-r'), { y: '-=40', autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 0.6);
      if (ev === 'sangeet') tl.from(svg.querySelectorAll('.bell'), { y: -10, autoAlpha: 0, duration: 0.4, stagger: 0.04 }, 0.7);
      if (ev === 'shaadi') {
        tl.from(svg.querySelector('.drape-l'), { x: -150, duration: 1.1, ease: 'power3.out' }, 0.7)
          .from(svg.querySelector('.drape-r'), { x: 150, duration: 1.1, ease: 'power3.out' }, 0.7)
          .from(svg.querySelector('.knot'), { scale: 0, svgOrigin: '160 114', duration: 0.6, ease: 'back.out(2)' }, 1.55)
          .from(svg.querySelectorAll('.diya'), { opacity: 0.25, duration: 0.3, stagger: 0.18 }, 1.2)
          .from(svg.querySelectorAll('.dflame'), { scale: 0, transformOrigin: '50% 100%', duration: 0.4, stagger: 0.18, ease: 'back.out(2)' }, 1.2);
      }
      tl.from(ch.querySelectorAll('.reveal'), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.07 }, 0.65);
      ScrollTrigger.create({ trigger: ch, start: 'top bottom', end: 'bottom top', onToggle: (s) => { vis = s.isActive; if (ready) (vis ? loop.play() : loop.pause()); } });

      if (ev === 'sangeet') {
        const drum = svg.querySelector('.dholak'), bells = svg.querySelectorAll('.bell');
        ch.querySelector('.medbtn').addEventListener('click', () => {
          gsap.timeline()
            .to(drum, { scaleX: 1.09, scaleY: 0.94, svgOrigin: '160 170', duration: 0.07, ease: 'power2.out' })
            .to(drum, { scaleX: 1, scaleY: 1, svgOrigin: '160 170', duration: 0.35, ease: 'power3.out' })
            .to(bells, { rotation: (i) => (i % 2 ? 20 : -20), transformOrigin: '50% 0%', duration: 0.07, stagger: 0.01 }, 0)
            .to(bells, { rotation: 0, duration: 0.5, ease: 'power3.out', stagger: 0.01 }, 0.08);
        });
      }

      if (!desk) {
        gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } })
          .fromTo(ch, { scale: 0.93, opacity: 0.55 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'none' })
          .to(ch, { scale: 1, opacity: 1, duration: 0.3 })
          .to(ch, { scale: 0.95, opacity: 0.6, duration: 0.35, ease: 'none' });
      } else if (fine) {
        const medal = svg.querySelector('.medal');
        ch.addEventListener('pointerenter', () => { gsap.to(medal, { rotation: 4, scale: 1.03, transformOrigin: '50% 50%', duration: 0.6, ease: 'power3.out' }); });
        ch.addEventListener('pointerleave', () => { gsap.to(medal, { rotation: 0, scale: 1, duration: 0.7, ease: 'power3.out' }); });
      }
    });

    gsap.utils.toArray('.threads path').forEach((p) => {
      gsap.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, ease: 'none', scrollTrigger: { trigger: p.closest('svg'), start: 'top 92%', end: 'center 58%', scrub: true } });
    });

    /* mangalashtak: reveals, verse lit word by word, drifting specks */
    gsap.utils.toArray('#mangal .reveal, #rsvp .reveal').forEach((el) => {
      gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    gsap.fromTo('#verse .vw', { opacity: 0.2, y: 6 }, { opacity: 1, y: 0, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '#verse', start: 'top 78%', end: 'bottom 42%', scrub: true } });
    ScrollTrigger.create({ trigger: '#savdhan', start: 'top 82%', once: true, onEnter: () => burst(24) });
    const specks = gsap.utils.toArray('#specks .speck').map((s, i) => gsap.timeline({ repeat: -1, delay: (i % 7) * 1.1, paused: true })
      .to(s, { opacity: 0.75, duration: 1.6, ease: 'sine.inOut' })
      .to(s, { y: rand(-40, -24), x: rand(-14, 14), duration: 5 + (i % 5) * 1.4, ease: 'sine.inOut' }, 0)
      .to(s, { opacity: 0, duration: 1.8, ease: 'sine.inOut' }, '-=1.8'));
    ScrollTrigger.create({ trigger: '#mangal', start: 'top bottom', end: 'bottom top', onToggle: (s) => specks.forEach((t) => (s.isActive ? t.play() : t.pause())) });

    /* countdown ticks only while visible; the RSVP slides over it like a curtain */
    ScrollTrigger.create({ trigger: '.curtain', start: 'top bottom', endTrigger: '#rsvp', end: 'top top', onToggle: (s) => (cdVisible = s.isActive) });
    gsap.from('#rsvp h2 .ch', { yPercent: 70, rotationX: -50, transformPerspective: 400, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.03, scrollTrigger: { trigger: '#rsvp h2', start: 'top 88%', once: true } });

    const thaliLoop = blessingLoop(document.querySelector('#rsvp .med svg'));
    ScrollTrigger.create({ trigger: '#rsvp .med', start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? thaliLoop.play() : thaliLoop.pause()) });
    return () => cleanups.forEach((fn) => fn());
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
