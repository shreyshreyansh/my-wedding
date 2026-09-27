// iCalendar files for "save the date": UTC times, a reminder the day before, and a SEQUENCE so updates replace the old event.

export interface IcsEvent { uid: string; start: string; end: string; title: string; where: string; description: string; sequence: number; stamp: Date }

export const utc = (iso: string | Date) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
export const icsText = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Lines longer than 75 octets are folded with CRLF + space, never inside a UTF-8 character. */
export function fold(line: string) {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = '', size = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (size + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; size = 0; }
    cur += ch; size += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}

export function buildIcs(e: IcsEvent) {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Shreyansh and Mrunalini//Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + e.uid,
    'DTSTAMP:' + utc(e.stamp),
    'SEQUENCE:' + e.sequence,
    'DTSTART:' + utc(e.start),
    'DTEND:' + utc(e.end),
    'SUMMARY:' + icsText(e.title),
    'LOCATION:' + icsText(e.where),
    'DESCRIPTION:' + icsText(e.description),
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText('Tomorrow: ' + e.title), 'TRIGGER:-P1D', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', ''
  ].map(fold).join('\r\n');
}
