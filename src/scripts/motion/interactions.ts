// Small responses to touch: counters rolling, the akshata toss when a reply is sent, panels coming in.
import { gsap } from 'gsap';
import { app } from '../app';
import { burst } from './burst';

export function interactions() {
  app.hooks.knot = (r) => { gsap.fromTo(r.querySelector('.rite-ic'), { rotation: -90, scale: 0.6 }, { rotation: 0, scale: 1, duration: 0.6, ease: 'back.out(2.4)' }); };
  app.hooks.bump = (out, d) => { gsap.fromTo(out, { yPercent: d > 0 ? 40 : -40, opacity: 0.3 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }); };
  app.hooks.tick = (el) => { gsap.fromTo(el, { yPercent: -45, opacity: 0.4 }, { yPercent: 0, opacity: 1, duration: 0.38, ease: 'power2.out' }); };
  app.hooks.burst = burst;
  app.hooks.toss = () => burst(30, true);
  app.hooks.reveal = (el) => { gsap.from(el, { autoAlpha: 0, y: 16, duration: 0.6, ease: 'power3.out', clearProps: 'all' }); };
}
