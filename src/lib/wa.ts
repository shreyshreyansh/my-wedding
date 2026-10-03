// The pre-written WhatsApp reply, used when sending fails and when replies have closed. Shared by the page and the edge.

export function waLink(number: string, text: string) {
  return 'https://wa.me/' + number.replace(/\D/g, '') + '?text=' + encodeURIComponent(text);
}

export interface Row { name: string; n: number }

export function rsvpMessage(o: { label: string; code: string; rows: Row[]; name?: string; note?: string }) {
  const lines = ['RSVP · ' + o.label + ' (' + o.code + ')'];
  for (const r of o.rows) lines.push(r.name + ': ' + r.n);
  if (o.name) lines.push('From: ' + o.name);
  if (o.note) lines.push('Note: ' + o.note);
  return lines.join('\n');
}

/** the words around the number in a reply's summary; deva: write the number in Devanagari digits */
export interface Words { one: string; many: string; no: string; deva?: boolean }
const EN: Words = { one: 'guest', many: 'guests', no: 'not coming' };
const digits = (n: number, deva?: boolean) => (deva ? String(n).replace(/\d/g, (d) => '०१२३४५६७८९'[+d]) : String(n));

/** "Haldi · 2 guests", "Sangeet · not coming"; "हळद · २ पाहुणे" with the Marathi words */
export const summaryLine = (r: Row, w: Words = EN) => r.name + ' · ' + (r.n ? digits(r.n, w.deva) + ' ' + (r.n === 1 ? w.one : w.many) : w.no);

export const closedMessage = (label: string, code: string) => 'Namaste! This is ' + label + ' (' + code + '), about the wedding RSVP.';
