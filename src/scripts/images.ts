// The paintings: each fades in over its blurred sketch once it has loaded, and while the guest reads the cover
// and the names, the ones further down are fetched in page order, one at a time, so they are there when the
// scroll reaches them. A phone in data-saver mode (or on a very slow connection) only fetches as it scrolls.
import { $$ } from './app';

type Conn = Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };

export function initImages() {
  const imgs = $$<HTMLImageElement>('picture img');
  const shown = (img: HTMLImageElement) => img.classList.add('in');
  for (const img of imgs) {
    if (img.complete && img.naturalWidth) shown(img);
    else { img.addEventListener('load', () => shown(img), { once: true }); img.addEventListener('error', () => shown(img), { once: true }); }
  }
  const c = (navigator as Conn).connection;
  if (c?.saveData || /(^|-)2g$/.test(c?.effectiveType || '')) return;
  const queue = imgs.filter((i) => i.loading === 'lazy');
  const next = () => {
    const img = queue.shift();
    if (!img) return;
    if (img.complete && img.naturalWidth) { next(); return; }
    let done = false;
    const go = () => { if (!done) { done = true; setTimeout(next, 120); } };
    img.addEventListener('load', go, { once: true });
    img.addEventListener('error', go, { once: true });
    setTimeout(go, 6000);
    img.loading = 'eager';
  };
  /* start once the cover's own painting is in */
  const start = () => setTimeout(next, 300);
  if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
}
