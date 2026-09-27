// Essential behaviour: the cover, countdown, RSVP and calendar. No animation library here, so the invitation
// works even if the motion chunk never arrives. Motion is loaded after, unless the guest wants it still.
import { app, isStill } from './app';
import { initCover } from './cover';
import { initCountdown } from './countdown';
import { initRsvp } from './rsvp';
import { initCalendar } from './calendar';

(window as unknown as { __smBooted: boolean }).__smBooted = true;

const cover = initCover(() => { /* music starts here (M2) */ });
initCountdown();
initRsvp();
initCalendar(document.documentElement.dataset.knotBusy || 'Opening your calendar…');

if (!cover || isStill()) {
  cover?.show();
} else {
  // Show the cover as soon as the entrance is ready, or after 1.5s without it.
  let shown = false;
  const show = () => { if (!shown) { shown = true; cover.show(); } };
  const late = setTimeout(show, 1500);
  import('./motion')
    .then((m) => { clearTimeout(late); m.start({ intro: !shown && !app.opened }); show(); })
    .catch(show);
}
