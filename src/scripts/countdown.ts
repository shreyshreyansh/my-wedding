// Countdown to the muhurat, in days, hours, minutes and seconds.
import { app, $ } from './app';

export function initCountdown() {
  const box = $('#count');
  if (!box) return;
  const target = Date.parse(box.dataset.target!);
  const els = ['d', 'h', 'm', 's'].map((k) => $('#cd-' + k)!);
  let last: string[] = [];
  const tick = (animate: boolean) => {
    const ms = Math.max(0, target - Date.now());
    const vals = [String(Math.floor(ms / 86400000)), String(Math.floor((ms % 86400000) / 3600000)).padStart(2, '0'), String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0'), String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')];
    vals.forEach((v, i) => {
      if (v === last[i]) return;
      els[i].textContent = v;
      if (animate) app.hooks.tick?.(els[i]);
    });
    last = vals;
  };
  tick(false);
  setInterval(() => { if (app.countdownVisible && !document.hidden) tick(true); }, 1000);
}
