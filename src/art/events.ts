// Event props, drawn half Paithani (gold on silk), half Madhubani (double line on paper).
// Pure SVG-string functions, rendered at build time. Class names are the hooks the motion loops use.
import { C, HALDI_Y, f } from './palette';
import { frame } from './peacock';

export type ArtId = 'haldi' | 'sangeet' | 'shaadi' | 'blessing';

const ART: Record<ArtId, (clip: string) => string> = {
  haldi: (clip: string) =>
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

  sangeet: (clip: string) =>
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

  shaadi: (clip: string) => {
    const diyas = Array.from({ length: 7 }, (_, i) => {
      const a = (222 + i * 16) * Math.PI / 180, x = 160 + 106 * Math.cos(a), y = 160 + 106 * Math.sin(a), side = x < 158 ? 'l' : x > 162 ? 'r' : 'm';
      const her = '<path d="M-10 0C-10 7 0 7.5 0 7.5V0Z" fill="' + C.zari + '"/><path d="M0 0V7.5C0 7.5 10 7 10 0Z" fill="' + C.zari + '"/><path d="M-10 0H10" stroke="' + C.mor + '" stroke-width="1.6"/>';
      const his = '<path d="M-10 0C-10 7 10 7 10 0Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.6" stroke-linejoin="round"/>';
      const both = '<path d="M-10 0C-10 7 0 7.5 0 7.5V0Z" fill="' + C.zari + '"/><path d="M0 0V7.5C4 7.5 10 7 10 0Z" fill="' + C.haldi + '" stroke="' + C.kajal + '" stroke-width="1.6" stroke-linejoin="round"/>';
      return '<g class="diya" transform="translate(' + f(x) + ' ' + f(y) + ')">' + (side === 'l' ? her : side === 'r' ? his : both) +
        '<g class="dflame"><path d="M0 -1C-4 -6 -2 -11 0 -14C2 -11 4 -6 0 -1Z" fill="' + HALDI_Y + '"/><path d="M0 -2C-1.6 -4.5 -1 -7 0 -8.5C1 -7 1.6 -4.5 0 -2Z" fill="' + C.sindoor + '"/></g></g>';
    }).join('');
    const kalash = (cx: number, his: boolean) => {
      const k = his ? ' stroke="' + C.kajal + '" stroke-width="2" stroke-linejoin="round"' : '';
      const leaf = (d: string) => '<path d="' + d + '" fill="' + C.sal + '"' + (his ? ' stroke="' + C.kajal + '" stroke-width="1.4" stroke-linejoin="round"' : '') + '/>';
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
    const ticks = (x0: number, x1: number, y0: number, y1: number) => { let d = ''; for (let x = x0; x <= x1; x += 6) d += 'M' + x + ' ' + y0 + 'V' + y1; return d; };
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

/** One event medallion. `clipId` must be unique in the page. */
export function eventArt(ev: ArtId, clipId = 'evclip-' + ev) {
  return '<svg viewBox="0 0 320 320" aria-hidden="true"><defs><clipPath id="' + clipId + '"><circle cx="160" cy="160" r="133"/></clipPath></defs><g class="medal">' + frame() + '<g class="art">' + ART[ev](clipId) + '</g></g></svg>';
}
