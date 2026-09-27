// Small responses to touch: the letter wave, footprints walking, the knot tying, counters rolling, the akshata toss.
import { gsap } from 'gsap';
import { app, root, $$ } from '../app';
import { burst } from './burst';
import { rand } from './shared';

export function interactions() {
  $$('.wave').forEach((el) => {
    const run = () => {
      if (!root.classList.contains('motion')) return;
      const chs = el.querySelectorAll('.ch');
      if (gsap.isTweening(chs)) return;
      gsap.to(chs, { y: -8, rotation: -4, duration: 0.22, ease: 'sine.out', stagger: 0.035, yoyo: true, repeat: 1 });
    };
    el.addEventListener('pointerenter', run);
    el.addEventListener('click', run);
  });

  const walk = (r: HTMLElement) => root.classList.contains('motion') && gsap.fromTo(r.querySelectorAll('.step'), { opacity: 0.15 }, { opacity: 1, duration: 0.28, stagger: 0.2, ease: 'power2.out' });
  $$('.rite[data-rite="way"]').forEach((r) => {
    r.addEventListener('pointerenter', () => walk(r));
    r.addEventListener('click', () => walk(r));
  });

  app.hooks.knot = (r) => {
    gsap.fromTo(r.querySelector('.knot-b'), { scale: 1.45 }, { scale: 1, svgOrigin: '30 30', duration: 0.6, ease: 'back.out(3)' });
    gsap.fromTo(r.querySelector('.tie'), { rotation: -10 }, { rotation: 0, svgOrigin: '30 30', duration: 0.9, ease: 'elastic.out(1, 0.4)' });
  };
  app.hooks.bump = (out, d) => { gsap.fromTo(out, { yPercent: d > 0 ? 40 : -40, opacity: 0.3 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }); };
  app.hooks.tick = (el) => { gsap.fromTo(el, { yPercent: -45, opacity: 0.4 }, { yPercent: 0, opacity: 1, duration: 0.38, ease: 'power2.out' }); };
  app.hooks.burst = burst;
  /* the rice leaves the thali and the akshata falls; the next toss puts the rice back first */
  let toss: gsap.core.Timeline | null = null;
  app.hooks.toss = () => {
    toss?.revert();
    const rice = document.querySelectorAll('#rsvp .med .rice');
    toss = gsap.timeline()
      .to(rice, { y: () => '-=' + rand(60, 120).toFixed(1), x: () => '+=' + rand(-60, 60).toFixed(1), rotation: () => '+=' + rand(-200, 200).toFixed(0), opacity: 0, duration: 1.1, ease: 'power2.out', stagger: 0.012 }, 0)
      .add(() => burst(26), 0.15);
  };
  app.hooks.reveal = (el) => { gsap.from(el, { autoAlpha: 0, y: 16, duration: 0.6, ease: 'power3.out', clearProps: 'all' }); };
}
