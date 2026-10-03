// Essential behaviour: the cover, music, countdown, RSVP and calendar. No animation library here, so the invitation
// works even if the motion chunk never arrives. Motion loads after, unless the guest wants the page still.
import { app, isStill } from './app';
import { initCover } from './cover';
import { initCountdown } from './countdown';
import { initRsvp } from './rsvp';
import { initCalendar } from './calendar';
import { initMusic } from './music';
import { initMotionPref } from './motion-pref';
import { chime } from './chime';

(window as unknown as { __smBooted: boolean }).__smBooted = true;

const labels = JSON.parse(document.getElementById('labels')?.textContent || '{}');
const startMusic = initMusic();
/* the bell and the music start inside the tap: browsers allow sound only then */
const cover = initCover(() => { chime(); startMusic(); });
initCountdown();
initRsvp(labels.rsvp);
initCalendar(labels.knotBusy);

type Motion = typeof import('./motion');
let motion: Promise<Motion> | null = null;
const loadMotion = () => (motion ??= import('./motion'));

initMotionPref(
  () => { loadMotion().then((m) => m.start({ intro: false })).catch(() => {}); },
  () => { motion?.then((m) => m.stop()).catch(() => {}); }
);

if (!cover || isStill()) {
  cover?.show();
  if (!cover && !isStill()) loadMotion().then((m) => m.start({ intro: false })).catch(() => {});
} else {
  // Show the cover as soon as its entrance is ready, or after 1.5s without it.
  let shown = false;
  const show = () => { if (!shown) { shown = true; cover.show(); } };
  const late = setTimeout(show, 1500);
  loadMotion()
    .then((m) => { clearTimeout(late); m.start({ intro: !shown && !app.opened }); show(); })
    .catch(show);
}
