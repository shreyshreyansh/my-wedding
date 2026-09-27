// The motion chunk, loaded by main.ts after the essentials. Everything here is decoration: if it fails, the invitation still works.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { app, fine, root } from '../app';
import { coverMotion } from './cover';
import { hero } from './hero';
import { interactions } from './interactions';
import { mangal, curtain } from './mangal';
import { meeting } from './meeting';
import { ribbons } from './ribbons';
import { schedule } from './schedule';
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
      gsap.ticker.add((t) => lenis.raf(t * 1000));
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
  mm.add({ phone: '(max-width: 599px)', desk: '(min-width: 1024px)' }, (c) => {
    const { phone, desk } = c.conditions as { phone: boolean; desk: boolean };
    const cleanups: (() => void)[] = [];
    const run: Run = {
      phone, desk, fine,
      on: (el, type, fn) => { el.addEventListener(type, fn); cleanups.push(() => el.removeEventListener(type, fn)); },
      cleanup: (fn) => cleanups.push(fn)
    };
    /* progress thread in the zari selvedge */
    gsap.to('#progress', { scaleY: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    hero(run);
    ribbons(run);
    meeting(run);
    schedule(run);
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
  shared.lenis?.destroy();
  shared.lenis = null;
  shared.heroIntro = null;
  root.classList.remove('motion');
  app.hooks = {};
}
