// The motion chunk, loaded by main.ts after the essentials. Everything here is decoration: if it fails, the invitation still works.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { app, fine, root } from '../app';
import { coverMotion } from './cover';
import { hero } from './hero';
import { interactions } from './interactions';
import { mangal, curtain } from './mangal';
import { schedule } from './schedule';
import { tours } from './tour';
import { shared, type Run } from './shared';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
/* read by the tests (trigger counts) */
(window as unknown as { __motion: object }).__motion = { gsap, ScrollTrigger };

let mm: gsap.MatchMedia | null = null;

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

  app.hooks.afterOpen = () => {
    shared.lenis?.start();
    ScrollTrigger.refresh();
    shared.heroIntro?.play();
  };

  mm = gsap.matchMedia();
  /* every width is covered: tablets (600 to 1023 px) get the same motion as the rest */
  mm.add({ phone: '(max-width: 599px)', tab: '(min-width: 600px) and (max-width: 1023px)', desk: '(min-width: 1024px)' }, (c) => {
    const { phone, tab, desk } = c.conditions as { phone: boolean; tab: boolean; desk: boolean };
    const cleanups: (() => void)[] = [];
    const run: Run = {
      phone, tab, desk, fine,
      on: (el, type, fn) => { el.addEventListener(type, fn); cleanups.push(() => el.removeEventListener(type, fn)); },
      cleanup: (fn) => cleanups.push(fn)
    };
    hero(run);
    schedule();
    tours(run);
    mangal();
    curtain();
    return () => cleanups.forEach((fn) => fn());
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** Gentle motion: put every section back in its still, final state. */
export function stop() {
  mm?.revert();
  mm = null;
  if (shared.lenisTick) gsap.ticker.remove(shared.lenisTick);
  shared.lenis?.destroy();
  shared.lenis = null;
  shared.lenisTick = null;
  shared.heroIntro = null;
  root.classList.remove('motion');
  app.hooks = {};
}
