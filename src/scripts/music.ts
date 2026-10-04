// The couple's recording. play() runs inside the cover tap (browsers only allow sound after a tap).
// It pauses when the guest switches apps, and remembers a mute. On an iPhone it plays the way a video does, through
// the ring/silent switch: as "ambient" sound (the chime's setting) a phone on silent would play it without a sound.
import { $ } from './app';

const KEY = 'sm-muted';
const get = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const set = (v: boolean) => { try { v ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY); } catch { /* private mode */ } };
/* the Audio Session API (Safari 16.4+, and so every browser on an iPhone): how the page's sound meets the silent switch */
type Nav = Navigator & { audioSession?: { type: string } };
const asPlayback = () => { try { const s = (navigator as Nav).audioSession; if (s) s.type = 'playback'; } catch { /* older iPhones decide by themselves */ } };

export function initMusic() {
  const audio = $<HTMLAudioElement>('#music'), box = $('#controls'), btn = $<HTMLButtonElement>('#bellBtn');
  if (!audio || !box || !btn) return () => {};
  audio.loop = !!audio.dataset.loop;
  let muted = get(), resume = false;
  const sync = () => {
    const on = !audio.paused;
    btn.dataset.state = on ? 'on' : 'off';
    btn.setAttribute('aria-label', (on ? btn.dataset.on : btn.dataset.off) || '');
  };
  const play = () => { asPlayback(); const p = audio.play(); p?.then(sync).catch(sync); };
  ['play', 'pause', 'ended'].forEach((t) => audio.addEventListener(t, sync));
  btn.addEventListener('click', () => {
    if (audio.paused) { muted = false; if (audio.ended) audio.currentTime = 0; play(); } else { muted = true; audio.pause(); }
    set(muted);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resume = !audio.paused; audio.pause(); } else if (resume && !muted) { play(); }
  });
  sync();
  /** called synchronously in the cover tap */
  return () => {
    box.hidden = false;
    if (!muted) play();
    const hint = box.querySelector('.bell-hint');
    setTimeout(() => hint?.classList.add('gone'), 3000);
  };
}
