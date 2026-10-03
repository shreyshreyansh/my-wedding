// The RSVP: steppers, sending to /api/rsvp with a timeout and one retry, the WhatsApp fallback,
// "Change my reply", and a quiet resend on the next visit if a reply never got through.
import { app, $, $$ } from './app';
import { rsvpMessage, summaryLine, waLink, type Row } from '../lib/wa';

interface Reply { n: Record<string, number>; name: string; note: string; at: string; rev: number; rid: string }
interface GuestInfo { code: string; label: string; ev: string[]; party: number; max: number; lang: string; wa: string; t: number; closed: boolean; reply: Reply | null }
interface Payload { g: string; t: string; rid: string; name: string; note: string; hp: string; n: Record<string, number>; base: number }

class Stop extends Error {}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const store = {
  get: (k: string) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set: (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  del: (k: string) => { try { localStorage.removeItem(k); } catch { /* private mode */ } }
};

/** POST with an 8s timeout and one retry (same rid, so the server never counts it twice). */
async function send(p: Payload): Promise<Reply> {
  let waits = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p), signal: ctrl.signal, credentials: 'omit' });
      if (res.status === 410) throw new Stop('closed');
      if (res.status === 404) throw new Stop('code');
      const j = await res.json();
      /* sent within moments of the page opening: the server asks for a short wait */
      if (res.status === 429 && waits++ < 3) { await sleep(Math.min(5000, (Number(j.wait) || 1500) + 250)); attempt--; continue; }
      if (j.ok && j.reply) return j.reply as Reply;
    } catch (e) {
      if (e instanceof Stop) throw e;
    } finally {
      clearTimeout(timer);
    }
    if (attempt === 0) await sleep(1200);
  }
  throw new Error('network');
}

export function initRsvp(labels: { send: string; sending: string; none: string }) {
  const sec = $('#rsvp'), form = $<HTMLFormElement>('#rsvpForm'), data = $('#guest');
  if (!sec || !form || !data) return;
  let guest: GuestInfo;
  try { guest = JSON.parse(data.textContent || ''); } catch { return; }
  const pendingKey = 'sm-pending:' + guest.code;
  const thanks = $('.r-thanks', sec)!, failed = $('.r-failed', form)!, sendLabel = $('.r-send span', form)!;
  const inputs = $$<HTMLInputElement>('input.r-count', form);
  const setState = (s: string) => { sec.dataset.rsvp = s; };
  const max = (i: HTMLInputElement) => Number(i.max) || guest.max || 20;
  const nameOf = (i: HTMLInputElement) => i.closest('.row')!.querySelector('b')!.textContent!;

  /* steppers: the number itself is a real input, so it also works typed, and without JavaScript */
  const clamp = (i: HTMLInputElement, v: number) => {
    i.value = String(Math.max(0, Math.min(max(i), Math.round(v) || 0)));
    const [down, up] = i.parentElement!.querySelectorAll('button');
    down.disabled = Number(i.value) <= 0;
    up.disabled = Number(i.value) >= max(i);
  };
  inputs.forEach((i) => {
    clamp(i, Number(i.value));
    i.addEventListener('change', () => clamp(i, Number(i.value)));
    i.parentElement!.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.addEventListener('click', () => {
      const d = Number(b.dataset.d);
      clamp(i, Number(i.value) + d);
      app.hooks.bump?.(i, d);
    }));
  });

  const rows = (n: Record<string, number>): Row[] => inputs.map((i) => ({ name: nameOf(i), n: n[i.name.slice(2)] ?? 0 }));
  const payload = (rid: string): Payload => {
    const f = new FormData(form);
    const n: Record<string, number> = {};
    inputs.forEach((i) => { n[i.name.slice(2)] = Number(i.value); });
    return { g: guest.code, t: String(f.get('t') || guest.t), rid, name: String(f.get('name') || '').trim(), note: String(f.get('note') || '').trim(), hp: '', n, base: guest.reply?.rev ?? 0 };
  };

  function showReplied(reply: Reply, focus = true) {
    guest.reply = reply;
    const list = $('.r-summary', thanks)!;
    const none = Object.values(reply.n).every((n) => !n);
    list.replaceChildren(...(none ? [labels.none] : rows(reply.n).map(summaryLine)).map((t) => Object.assign(document.createElement('li'), { textContent: t })));
    setState('replied');
    if (focus) thanks.focus({ preventScroll: true });
    app.hooks.reveal?.(thanks);
  }
  function showFailed(p: Payload) {
    const msg = rsvpMessage({ label: guest.label, code: guest.code, rows: rows(p.n), name: p.name, note: p.note });
    $<HTMLAnchorElement>('.r-wa', failed)!.href = waLink(guest.wa || '', msg);
    failed.hidden = false;
    setState('failed');
  }

  let rid = '';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sec.dataset.rsvp === 'sending') return;
    rid = rid || uuid();
    const p = payload(rid);
    setState('sending');
    failed.hidden = true;
    sendLabel.textContent = labels.sending;
    app.hooks.toss?.();
    try {
      const reply = await send(p);
      store.del(pendingKey);
      rid = '';
      showReplied(reply);
    } catch (err) {
      if (err instanceof Stop && err.message === 'closed') { setState('closed'); return; }
      store.set(pendingKey, p);
      showFailed(p);
    } finally {
      sendLabel.textContent = labels.send;
    }
  });
  $('.r-retry', form)?.addEventListener('click', () => form.requestSubmit());

  $('.r-change', thanks)?.addEventListener('click', (e) => {
    e.preventDefault();
    const r = guest.reply;
    if (r) {
      inputs.forEach((i) => clamp(i, r.n[i.name.slice(2)] ?? 0));
      ($<HTMLInputElement>('#rsvpName')!).value = r.name;
      ($<HTMLTextAreaElement>('#rsvpNote')!).value = r.note;
    }
    setState('form');
    inputs[0]?.focus({ preventScroll: true });
  });

  /* a reply that didn't get through last time: send it quietly, unless something newer has arrived since */
  const pending = store.get(pendingKey) as Payload | null;
  if (pending && !guest.closed && (guest.reply?.rev ?? 0) <= pending.base && guest.reply?.rid !== pending.rid) {
    send(pending).then((reply) => { store.del(pendingKey); if (sec.dataset.rsvp !== 'sending') showReplied(reply, false); }).catch(() => { /* try again next visit */ });
  } else if (pending) {
    store.del(pendingKey);
  }
}
