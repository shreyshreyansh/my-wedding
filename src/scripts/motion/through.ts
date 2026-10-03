// Through the medallion: the silk rises over the page with its gold medallion open, then the camera flies through
// it into the Ganesha painting, which settles from a slow zoom; the caption comes up last.
import { gsap } from 'gsap';
import type { Run } from './shared';

export function through(_run: Run) {
  const sec = document.getElementById('through');
  if (!sec) return;
  const silk = sec.querySelector<HTMLElement>('.th-silk')!;
  gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.4 }, defaults: { ease: 'none' } })
    .fromTo(silk, { scale: 1 }, { scale: 9, duration: 0.62, ease: 'power2.in' }, 0.08)
    .to(silk, { autoAlpha: 0, duration: 0.08 }, 0.6)
    .fromTo('#through .th-art', { scale: 1.35 }, { scale: 1, duration: 0.8, ease: 'power1.out' }, 0.1)
    .from('#through .th-cap > *', { y: 24, autoAlpha: 0, duration: 0.14, stagger: 0.05 }, 0.72);
}
