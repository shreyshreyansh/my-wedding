// The cover (antarpat): made to fit the screen, locked until the guest taps the seal. Works without the motion chunk.
import { coverToran, twinkles } from '../art/cover';
import { app, root, $, isPhone, isStill } from './app';

/** `onTap` runs synchronously inside the tap, so audio.play() is allowed by the browser. */
export function initCover(onTap: () => void) {
  const cover = $('#cover');
  if (!cover) return null;
  const phone = isPhone();
  $('#cvToran')!.innerHTML = coverToran(innerWidth, phone);
  $('#cvTw')!.innerHTML = twinkles(innerWidth, innerHeight, phone);
  root.classList.add('locked');
  const seal = $('#openBtn') as HTMLButtonElement;
  seal.focus({ preventScroll: true });

  function unlock() {
    root.classList.remove('locked');
    cover!.remove();
    app.hooks.afterOpen?.();
    $('#heroTitle')?.focus({ preventScroll: true });
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
  return { show: () => cover.classList.add('ready') };
}
