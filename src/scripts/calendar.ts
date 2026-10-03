// "Tie a knot to remember": Apple devices get the .ics file (Calendar opens it); everyone else gets Google Calendar.
import { app, $$ } from './app';

const apple = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && !/android/i.test(navigator.userAgent);

export function initCalendar(busy: string) {
  $$<HTMLAnchorElement>('.rite[data-rite="knot"]').forEach((r) => {
    if (apple() && r.dataset.ics) { r.href = r.dataset.ics; r.removeAttribute('target'); }
    /* the small line under the words (or the words themselves, on a one-language page) says it is working */
    const note = r.querySelector('i') ?? r.querySelector('b')!, idle = note.textContent;
    let t = 0;
    r.addEventListener('click', () => {
      note.textContent = busy;
      clearTimeout(t);
      t = window.setTimeout(() => { note.textContent = idle; }, 2600);
      app.hooks.knot?.(r);
    });
  });
}
