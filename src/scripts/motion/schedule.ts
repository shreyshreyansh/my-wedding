// The celebrations, the blessings and the two homes: titles and details rise as they arrive; the paintings are tours (tour.ts).
// Loops over the chapters that exist: the edge removes the ones a guest isn't invited to.
import { gsap } from 'gsap';
import { $$ } from '../app';

export function schedule() {
  $$<HTMLElement>('.sched-head, .hm-head, .ch-head, .ch-text, .iv-text').forEach((box) => {
    gsap.from(box.querySelectorAll('.reveal'), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: box, start: 'top 85%', once: true } });
  });
}
