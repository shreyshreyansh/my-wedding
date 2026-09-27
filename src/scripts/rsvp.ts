// RSVP steppers and send. (Interim: M2 replaces the local-only send with /api/rsvp and the WhatsApp fallback.)
import { app, $, $$ } from './app';

export function initRsvp() {
  const form = $<HTMLFormElement>('#rsvpForm');
  if (!form) return;
  const counts: Record<string, number> = {};
  $$<HTMLOutputElement>('output[id^="n-"]', form).forEach((o) => { counts[o.id.slice(2)] = Number(o.textContent); });
  const total = () => Object.values(counts).reduce((a, b) => a + b, 0);
  $$<HTMLButtonElement>('.step button', form).forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k!, d = Number(b.dataset.d);
    counts[k] = Math.max(0, Math.min(20, counts[k] + d));
    const out = $('#n-' + k)!;
    out.textContent = String(counts[k]);
    $('#total')!.textContent = String(total());
    app.hooks.bump?.(out, d);
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    $('#total2')!.textContent = String(total());
    const thanks = $('#thanks')!;
    const show = () => { form.hidden = true; thanks.hidden = false; };
    if (app.hooks.sent) app.hooks.sent(form, thanks, show);
    else show();
  });
}
