// The cover (antarpat): locked until the guest taps the seal. Works without the motion chunk.
import { app, root, $, isStill } from './app';

/** `onTap` runs synchronously inside the tap, so audio.play() is allowed by the browser. */
export function initCover(onTap: () => void) {
  const cover = $('#cover');
  if (!cover) return null;
  root.classList.add('locked');
  const seal = $('#openBtn') as HTMLButtonElement;
  /* the seal's focus ring is for keyboard users: show it only once a key is pressed */
  addEventListener('keydown', () => root.classList.add('kbd'), { once: true });

  function unlock() {
    root.classList.remove('locked');
    cover!.remove();
    app.hooks.afterOpen?.();
    /* a link to #rsvp (the reminder message) lands on the RSVP once the cloth falls */
    const target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (target) target.scrollIntoView({ block: 'start' });
    else $('#heroTitle')?.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
    document.dispatchEvent(new CustomEvent('invite:open'));
  }
  function open() {
    if (app.opened) return;
    app.opened = true;
    onTap();
    try { navigator.vibrate?.([14, 70, 20]); } catch { /* no haptics */ }
    if (app.hooks.open && !isStill()) app.hooks.open(unlock);
    else unlock();
  }
  seal.addEventListener('click', open);
  cover.querySelector('.cloth')!.addEventListener('click', (e) => { if (!seal.contains(e.target as Node)) open(); });
  /* the dialog's one action takes focus as soon as it can (hidden elements can't) */
  return { show: () => { cover.classList.add('ready'); seal.focus({ preventScroll: true, focusVisible: false } as FocusOptions); } };
}
