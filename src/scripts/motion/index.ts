// The motion chunk, loaded by main.ts after the essentials. Everything here is decoration: if it fails, the invitation still works.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { app, fine, root } from '../app';
import { coverMotion } from './cover';
import { interactions } from './interactions';
import { mangal, curtain } from './mangal';
import { reveal } from './reveal';
import { scene } from './scene';
import { shared, type Run } from './shared';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
/* read by the tests (trigger counts) */
(window as unknown as { __motion: object }).__motion = { gsap, ScrollTrigger };

export function start({ intro }: { intro: boolean }) {
  root.classList.add('motion');
  coverMotion(intro);
  interactions();

  /* smooth wheel scrolling for mouse users only; touch keeps the phone's own scrolling */
  if (fine) {
    import('lenis').then(({ default: Lenis }) => {
      if (!root.classList.contains('motion')) return;
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      shared.lenisTick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(shared.lenisTick);
      gsap.ticker.lagSmoothing(0);
      if (document.getElementById('cover')) lenis.stop();
      shared.lenis = lenis;
    }).catch(() => { /* native scrolling is fine */ });
  }

  /* the page's height doesn't change when the cover goes (the scrollbar's gutter is kept), so nothing is measured
     again in the middle of the opening */
  app.hooks.afterOpen = () => {
    shared.lenis?.start();
    shared.heroIntro?.play();
  };

  const mm = gsap.matchMedia();
  /* every width is covered: tablets (600 to 1023 px) get the same motion as the rest */
  mm.add({ phone: '(max-width: 599px)', tab: '(min-width: 600px) and (max-width: 1023px)', desk: '(min-width: 1024px)' }, (c) => {
    const { phone, tab, desk } = c.conditions as { phone: boolean; tab: boolean; desk: boolean };
    const cleanups: (() => void)[] = [];
    const run: Run = {
      phone, tab, desk, fine,
      on: (el, type, fn) => { el.addEventListener(type, fn); cleanups.push(() => el.removeEventListener(type, fn)); },
      cleanup: (fn) => cleanups.push(fn)
    };
    scene(run);
    reveal(run);
    mangal();
    curtain();
    return () => cleanups.forEach((fn) => fn());
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

