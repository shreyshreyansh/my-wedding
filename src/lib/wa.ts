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

/** "Haldi · 2 guests", "Sangeet · not coming" */
export const summaryLine = (r: Row) => r.name + ' · ' + (r.n ? r.n + (r.n === 1 ? ' guest' : ' guests') : 'not coming');

export const closedMessage = (label: string, code: string) => 'Namaste! This is ' + label + ' (' + code + '), about the wedding RSVP.';
