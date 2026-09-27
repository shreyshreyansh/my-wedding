// Chapter actions drawn as tokens: kumkum footprints ("show the way") and a tied knot ("tie a knot to remember").
import { C } from './palette';

export type Rite = 'way' | 'knot';

function riteDisc() {
  return '<path d="M30 3A27 27 0 0 0 30 57Z" fill="' + C.rani + '"/><path d="M30 3A27 27 0 0 1 30 57Z" fill="' + C.kagaz + '"/>' +
    '<path d="M30 1.5A28.5 28.5 0 0 0 30 58.5" fill="none" stroke="' + C.zari + '" stroke-width="1.2"/><path d="M30 5.5A24.5 24.5 0 0 0 30 54.5" fill="none" stroke="' + C.zari + '" stroke-width="2.4"/>' +
    '<path d="M30 3.5A26.5 26.5 0 0 1 30 56.5" fill="none" stroke="' + C.kajal + '" stroke-width="2.4" stroke-dasharray=".8 1.8"/>' +
    '<path d="M30 1.5A28.5 28.5 0 0 1 30 58.5M30 5.5A24.5 24.5 0 0 1 30 54.5" fill="none" stroke="' + C.kajal + '" stroke-width="1.3"/>';
}
function foot(x: number, y: number, rot: number, mirror: boolean, fill: string, edge?: string) {
  const st = edge ? ' stroke="' + edge + '" stroke-width=".8"' : '';
  return '<g class="step" transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')' + (mirror ? ' scale(-1 1)' : '') + '">' +
    '<path d="M0 -6.5C3.2 -6.5 4.1 -2.8 3.7 .8C3.3 4.6 2.4 7.4 0 7.4C-2.4 7.4 -3.1 3.8 -3.3 .8C-3.6 -2.8 -2.9 -6.5 0 -6.5Z" fill="' + fill + '"' + st + '/>' +
    [[-2.3, -8.9, 1.15], [-.6, -9.9, 1.2], [1.2, -9.7, 1.1], [2.7, -8.8, 1], [3.8, -7.3, .9]].map(([cx, cy, r]) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + st + '/>').join('') + '</g>';
}
export function riteIcon(kind: Rite) {
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
