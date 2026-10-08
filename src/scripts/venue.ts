// The venue card: Google's map loads only when a guest asks for it, and the address can be copied in one tap.
import { $ } from './app';

export function initVenue() {
  const map = $('.vn-map');
  map?.querySelector('.vn-show')?.addEventListener('click', () => {
    if (map.classList.contains('on')) return;
    const f = document.createElement('iframe');
    f.src = map.dataset.embed!;
    f.title = map.dataset.title || '';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer';
    f.allowFullscreen = true;
    map.append(f);
    map.classList.add('on');
  });
  const copy = $<HTMLButtonElement>('.vn-copy');
  copy?.addEventListener('click', async () => {
    const label = copy.querySelector('span')!, was = label.textContent;
    try {
      await navigator.clipboard.writeText(copy.dataset.copy!);
      label.textContent = copy.dataset.done || was;
      setTimeout(() => { label.textContent = was; }, 2200);
    } catch { /* no clipboard: the address is on the card to read */ }
  });
}
