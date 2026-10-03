// Turns the one static page into a family's own invitation, at the edge, as it streams:
// their name, only their events, their language, and their RSVP as they left it.
import type { Guest, Reply } from './guests';
import { copy, countWords, datesFor, events } from '../src/data/wedding';
import { closedMessage, summaryLine, waLink } from '../src/lib/wa';

export interface View {
  code: string | null;
  guest: Guest | null;
  /** a ?g= was given but didn't match anyone */
  bad: boolean;
  reply: Reply | null;
  /** replies have closed (after the deadline) */
  closed: boolean;
  /** "Change my reply" without JavaScript: open the form even though a reply exists */
  change: boolean;
  wa: string;
  now: number;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function summaryLines(g: Guest, r: Reply) {
  return g.ev.map((id) => summaryLine({ name: events.find((x) => x.id === id)!.name.en, n: r.n[id] ?? 0 }));
}

export function rsvpState(v: View): string {
  if (!v.guest) return 'nocode';
  if (v.reply && !v.change) return 'replied';
  if (v.closed) return 'closed';
  return 'form';
}

/** What the browser needs to send, retry and fall back to WhatsApp. No phone numbers of guests, ever. */
export function guestJson(v: View) {
  const g = v.guest!;
  return JSON.stringify({ code: v.code, label: g.label, ev: g.ev, party: g.party, max: g.max, lang: g.lang, wa: v.wa, t: v.now, closed: v.closed, reply: v.reply })
    .replace(/</g, '\\u003c');
}

export function personalize(res: Response, v: View): Response {
  const rw = new HTMLRewriter();
  const g = v.guest;

  if (v.bad) rw.on('[data-badcode]', { element: (el) => { el.removeAttribute('hidden'); } });
  rw.on('#rsvp', { element: (el) => { el.setAttribute('data-rsvp', rsvpState(v)); if (v.closed) el.setAttribute('data-closed', ''); } });
  if (!g) return rw.transform(res);

  const invited = new Set<string>(g.ev);
  const dates = datesFor(g.ev);
  const dev = g.lang !== 'en' && g.label_dev;
  const name = dev ? g.label_dev! : g.label;

  rw
    /* the greeting */
    .on('[data-guest-name]', { element: (el) => { el.setInnerContent(name); if (dev) el.setAttribute('lang', g.lang); } })
    .on('[data-guest-ask]', { element: (el) => { el.setInnerContent(cap(g.label) + ', ' + copy.rsvp.ask); } })
    .on('[data-dates-short]', { element: (el) => { el.setInnerContent(dates.short); } })
    .on('[data-dates-long]', { element: (el) => { el.setInnerContent(dates.long); } })
    /* only their events */
    .on('.chapter[data-event]', { element: (el) => { if (!invited.has(el.getAttribute('data-event')!)) el.remove(); } })
    .on('.chapters', { element: (el) => { el.setAttribute('style', '--n:' + g.ev.length); } })
    .on('[data-count-title]', { element: (el) => { el.setInnerContent(countWords[g.ev.length]); } })
    .on('.row[data-event]', { element: (el) => { if (!invited.has(el.getAttribute('data-event')!)) el.remove(); } })
    /* their language for the invitation card */
    .on('input[name="invlang"]', { element: (el) => { if (el.getAttribute('value') === g.lang) el.setAttribute('checked', ''); else el.removeAttribute('checked'); } })
    /* the RSVP form, prefilled with their last reply or their party size */
    .on('#rsvpForm input[name="g"]', { element: (el) => { el.setAttribute('value', v.code!); } })
    .on('#rsvpForm input[name="t"]', { element: (el) => { el.setAttribute('value', String(v.now)); } })
    .on('#rsvpForm input.r-count', {
      element: (el) => {
        const id = (el.getAttribute('name') || '').slice(2);
        el.setAttribute('max', String(g.max ?? g.party));
        el.setAttribute('value', String(v.reply ? v.reply.n[id as keyof Reply['n']] ?? 0 : g.party));
      }
    })
    .on('#rsvpName', { element: (el) => { if (v.reply?.name) el.setAttribute('value', v.reply.name); } })
    .on('#rsvpNote', { element: (el) => { if (v.reply?.note) el.setInnerContent(v.reply.note); } })
    .on('[data-reply-summary]', {
      element: (el) => {
        if (!v.reply) return;
        const lines = summaryLines(g, v.reply);
        const none = Object.values(v.reply.n).every((n) => !n);
        el.setInnerContent(none ? '<li>' + esc(copy.rsvp.none) + '</li>' : lines.map((l) => '<li>' + esc(l) + '</li>').join(''), { html: true });
      }
    })
    .on('.r-closed a.r-wa', { element: (el) => { el.setAttribute('href', waLink(v.wa, closedMessage(g.label, v.code!))); } })
    .on('a.r-change', { element: (el) => { el.setAttribute('href', '/?g=' + v.code + '&change=1#rsvp'); } })
    .on('body', { element: (el) => { el.append('<script type="application/json" id="guest">' + guestJson(v) + '</script>', { html: true }); } });
  return rw.transform(res);
}
