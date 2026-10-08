// Turns the one static page into a family's own invitation, at the edge, as it streams:
// their name, only their events, their language, and their RSVP as they left it. A ?name= greets one person by name.
// With ?lang= the page is already in that language (worker/index.ts); what is written in here follows it (src/data/i18n.ts).
import type { Guest, Reply } from './guests';
import { T, line, type View as Reading } from '../src/data/i18n';
import { closedMessage, waLink } from '../src/lib/wa';
import { isDevanagari } from './name';

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
  /** ?name=, already cleaned (server/name.ts): shown wherever the page speaks to the guest */
  person?: string | null;
  /** ?lang=: the page's language (mixed when there is none) */
  reading?: Reading;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function summaryLines(g: Guest, r: Reply, reading: Reading = 'mixed') {
  return g.ev.map((id) => line(reading, T(reading).ev[id].name, r.n[id] ?? 0));
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

/** the link's own ?lang= and ?name= carried into a link back to the page */
export function keep(v: View, q: Record<string, string>) {
  const s = new URLSearchParams(q);
  if (v.reading && v.reading !== 'mixed') s.set('lang', v.reading);
  if (v.person) s.set('name', v.person);
  return s.toString();
}

export function personalize(res: Response, v: View): Response {
  const rw = new HTMLRewriter();
  const g = v.guest;
  const reading = v.reading ?? 'mixed', t = T(reading);
  /* a Devanagari page (मराठी, हिंदी) */
  const deva = reading === 'mr' || reading === 'hi';
  /* a name inside the page's words: in its own language where that differs from the page's, and on a Devanagari page
     in the face that has every letter (base.css .who), since a name can be anything */
  const said = (s: string, lang: string) => {
    const own = lang === (deva ? reading : 'en') || (deva && lang !== 'en') ? '' : ' lang="' + lang + '"';
    return deva ? '<span class="who"' + own + '>' + esc(s) + '</span>' : own ? '<span' + own + '>' + esc(s) + '</span>' : esc(s);
  };

  if (v.bad) rw.on('[data-badcode]', { element: (el) => { el.removeAttribute('hidden'); } });
  rw.on('#rsvp', { element: (el) => { el.setAttribute('data-rsvp', rsvpState(v)); if (v.closed) el.setAttribute('data-closed', ''); } });

  /* a person's own name, from ?name=: on the cover, in the headings that speak to them, and in the RSVP */
  const p = v.person;
  if (p) {
    const dn = isDevanagari(p);
    const who = said(p, dn ? 'hi' : 'en');
    const fill = (tpl: string) => esc(tpl).replace('{name}', who);
    rw
      .on('[data-guest-name]', { element: (el) => { el.setInnerContent(who, { html: true }); } })
      .on('[data-for-title]', { element: (el) => { el.setInnerContent(fill(t.invite.titleFor), { html: true }); } })
      .on('[data-for-rsvp]', { element: (el) => { el.setInnerContent(fill(t.rsvp.titleFor), { html: true }); } })
      .on('[data-for-thanks]', { element: (el) => { el.setInnerContent(fill(t.rsvp.thanksFor), { html: true }); } })
      .on('[data-guest-ask]', { element: (el) => { el.setInnerContent(who + ', ' + esc(t.rsvp.ask), { html: true }); } })
      .on('#rsvpName', { element: (el) => { if (!v.reply?.name) el.setAttribute('value', p); } });
  }
  if (!g) return rw.transform(res);

  const invited = new Set<string>(g.ev);
  const dates = t.dates(g.ev);
  /* the family's name in Devanagari on a Marathi or Hindi page, or for a Marathi or Hindi family on the mixed page */
  const dev = !!g.label_dev && (deva || (reading === 'mixed' && g.lang !== 'en'));
  const name = dev ? g.label_dev! : g.label;
  const nameLang = dev ? (g.lang !== 'en' ? g.lang : reading) : deva ? 'en' : null;

  rw
    /* the greeting */
    .on('[data-guest-name]', { element: (el) => { if (p) return; el.setInnerContent(name); if (nameLang) el.setAttribute('lang', nameLang); } })
    .on('[data-guest-ask]', {
      element: (el) => {
        if (p) return;
        /* the family's English name on the mixed and English pages, as on the cover on the others */
        const who = deva ? said(cap(name), nameLang!) : esc(cap(g.label));
        el.setInnerContent(who + ', ' + esc(t.rsvp.ask), { html: true });
      }
    })
    .on('[data-dates-short]', { element: (el) => { el.setInnerContent(dates.short); } })
    .on('[data-dates-long]', { element: (el) => { el.setInnerContent(dates.long); } })
    /* only their events */
    /* only their celebrations: every element marked with one (its card, its RSVP row, what to wear for it) */
    .on('[data-event]', { element: (el) => { if (!invited.has(el.getAttribute('data-event')!)) el.remove(); } })
    .on('.chapters', { element: (el) => { el.setAttribute('style', '--n:' + g.ev.length); } })
    .on('[data-count-title]', { element: (el) => { el.setInnerContent(t.schedule.countWords[g.ev.length]); } })
    /* their language for the invitation card, unless the link chose one (?lang=) */
    .on('input[name="invlang"]', { element: (el) => { if (reading !== 'mixed') return; if (el.getAttribute('value') === g.lang) el.setAttribute('checked', ''); else el.removeAttribute('checked'); } })
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
        const lines = summaryLines(g, v.reply, reading);
        const none = Object.values(v.reply.n).every((n) => !n);
        el.setInnerContent(none ? '<li>' + esc(t.rsvp.none) + '</li>' : lines.map((l) => '<li>' + esc(l) + '</li>').join(''), { html: true });
      }
    })
    .on('.r-closed a.r-wa', { element: (el) => { el.setAttribute('href', waLink(v.wa, closedMessage(g.label, v.code!))); } })
    .on('a.r-change', { element: (el) => { el.setAttribute('href', '/?' + keep(v, { g: v.code!, change: '1' }) + '#rsvp'); } })
    .on('body', { element: (el) => { el.append('<script type="application/json" id="guest">' + guestJson(v) + '</script>', { html: true }); } });
  return rw.transform(res);
}
