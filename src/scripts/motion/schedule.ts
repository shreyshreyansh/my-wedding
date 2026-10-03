// The celebrations: each plate opens like a window as it arrives, and its painting drifts slowly while it is on
// screen (a Ken Burns move); the words follow. Loops over the chapters that exist: the edge removes the ones a
// guest isn't invited to.
import { gsap } from 'gsap';
import { $$ } from '../app';
import type { Run } from './shared';

export function schedule(run: Run) {
  if (!document.getElementById('schedule')) return;
  gsap.utils.toArray<HTMLElement>('#schedule .sched-head .reveal').forEach((el, i) => gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.85, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: '#schedule', start: 'top 80%', once: true } }));

  /* the Ganesha plate opens the same way */
  $$<HTMLElement>('.chapter, #invocation').forEach((ch) => {
    const frame = ch.querySelector<HTMLElement>('.plate-art, .iv-art')!, pic = frame.querySelector('picture')!;
    gsap.fromTo(frame, { clipPath: run.desk ? 'inset(12% 12% 12% 12%)' : 'inset(10% 8% 10% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', scrollTrigger: { trigger: frame, start: 'top 92%', end: 'top 30%', scrub: 0.5 } });
    gsap.fromTo(pic, { scale: 1.18, yPercent: -3 }, { scale: 1.02, yPercent: 3, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(ch.querySelector('.label'), { autoAlpha: 0, y: 8, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: frame, start: 'center 70%', once: true } });
    gsap.from(ch.querySelectorAll('.reveal'), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: ch.querySelector('.ch-text, .iv-text'), start: 'top 85%', once: true } });
  });
}
