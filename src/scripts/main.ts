// Essential behaviour: the cover, music, countdown, RSVP and calendar. No animation library here, so the invitation
// works even if the motion chunk never arrives. Motion loads after, unless the phone asks for reduced motion.
import { app, isStill } from './app';
import { initCover } from './cover';
import { initCountdown } from './countdown';
import { initRsvp } from './rsvp';
import { initCalendar } from './calendar';
import { initMusic } from './music';
import { chime } from './chime';
import { initImages } from './images';
import { initVenue } from './venue';

(window as unknown as { __smBooted: boolean }).__smBooted = true;

initImages();
const labels = JSON.parse(document.getElementById('labels')?.textContent || '{}');
const startMusic = initMusic();
/* the bell and the music start inside the tap: browsers allow sound only then. The music first: on an iPhone it sets
   how the page's sound meets the silent switch, and the chime follows it */
const cover = initCover(() => { startMusic(); chime(); });
initCountdown();
initRsvp(labels.rsvp);
initCalendar(labels.knotBusy);
initVenue();

type Motion = typeof import('./motion');
let motion: Promise<Motion> | null = null;
const loadMotion = () => (motion ??= import('./motion'));

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
