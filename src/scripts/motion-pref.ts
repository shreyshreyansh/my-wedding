// "Gentle motion / कम हलचल": the guest's own choice, over the phone's Reduce Motion setting. Remembered on this phone.
import { $, isStill, root } from './app';

export function initMotionPref(start: () => void, stop: () => void) {
  const btn = $<HTMLButtonElement>('#motionBtn');
  if (!btn) return;
  const sync = () => btn.setAttribute('aria-pressed', String(isStill()));
  sync();
  btn.addEventListener('click', () => {
    const still = !isStill();
    root.classList.toggle('still', still);
    try { localStorage.setItem('sm-motion', still ? 'gentle' : 'full'); } catch { /* private mode */ }
    if (still) stop(); else start();
    sync();
  });
}
