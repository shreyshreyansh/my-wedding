// Ambient loops inside the event medallions; each plays only while its event is on screen.
import { gsap } from 'gsap';
import { rand } from './shared';

export function haldiLoop(svg: SVGElement) {
  const master = gsap.timeline({ paused: true });
  const L = svg.querySelector('.leaf-l')!, R = svg.querySelector('.leaf-r')!;
  gsap.set(svg.querySelectorAll('.splash'), { scale: 0, transformOrigin: '50% 50%' });
  const dip = gsap.timeline({ repeat: -1, repeatDelay: 0.5 })
    .to(L, { rotation: 8, y: '+=8', svgOrigin: '100 92', duration: 0.5, ease: 'power2.inOut' })
    .fromTo(svg.querySelectorAll('.sl'), { scale: 0, opacity: 1 }, { scale: 1.5, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power2.out' })
    .to(L, { rotation: 0, y: '-=8', svgOrigin: '100 92', duration: 0.55, ease: 'power2.inOut' }, '<')
    .to(R, { rotation: -8, y: '+=8', svgOrigin: '220 92', duration: 0.5, ease: 'power2.inOut' }, '+=0.2')
    .fromTo(svg.querySelectorAll('.sr'), { scale: 0, opacity: 1 }, { scale: 1.5, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power2.out' })
    .to(R, { rotation: 0, y: '-=8', svgOrigin: '220 92', duration: 0.55, ease: 'power2.inOut' }, '<');
  master.add(dip, 0);
  svg.querySelectorAll('.petal').forEach((p, i) => master.add(gsap.fromTo(p, { y: -150, x: 0, rotation: 0 }, { y: 200, x: rand(-26, 26), rotation: rand(140, 380), transformOrigin: '50% 50%', duration: rand(4.5, 7.5), ease: 'none', repeat: -1 }), (i % 5) * 0.8));
  return master;
}
export function sangeetLoop(svg: SVGElement) {
  const master = gsap.timeline({ paused: true });
  const drum = svg.querySelector('.dholak')!, bells = svg.querySelectorAll('.bell');
  gsap.set(bells, { transformOrigin: '50% 0%' });
  const beat = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
  [0, 0.3].forEach((t) => {
    beat.to(drum, { scaleX: 1.05, scaleY: 0.97, svgOrigin: '160 170', duration: 0.08, ease: 'power2.out' }, t)
      .to(drum, { scaleX: 1, scaleY: 1, svgOrigin: '160 170', duration: 0.24, ease: 'power3.out' }, t + 0.08)
      .to(bells, { rotation: (i: number) => (i % 2 ? 14 : -14), duration: 0.08, ease: 'power2.out', stagger: 0.012 }, t)
      .to(bells, { rotation: 0, duration: 0.4, ease: 'power3.out', stagger: 0.012 }, t + 0.1);
  });
  master.add(beat, 0);
  svg.querySelectorAll('.note').forEach((n, i) => master.add(gsap.fromTo(n, { y: 20, opacity: 0 }, { keyframes: { y: [20, -6, -34, -60], opacity: [0, 1, 1, 0] }, duration: 2.8, ease: 'none', repeat: -1 }), i * 0.4));
  return master;
}
export function shaadiLoop(svg: SVGElement) {
  const master = gsap.timeline({ paused: true });
  svg.querySelectorAll('.flame').forEach((fl, i) => master.add(gsap.to(fl, { scaleY: rand(1.06, 1.14), scaleX: rand(0.92, 0.97), skewX: rand(-4, 4), transformOrigin: '50% 100%', duration: rand(0.18, 0.32), ease: 'sine.inOut', yoyo: true, repeat: -1 }), i * 0.05));
  svg.querySelectorAll('.dflame').forEach((fl, i) => master.add(gsap.to(fl, { scaleY: 1.18, transformOrigin: '50% 100%', duration: rand(0.25, 0.45), ease: 'sine.inOut', yoyo: true, repeat: -1 }), i * 0.07));
  master.add(gsap.fromTo(svg.querySelector('.knot')!, { rotation: -2.5 }, { rotation: 2.5, svgOrigin: '160 106', duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }), 0);
  return master;
}
export function blessingLoop(svg: SVGElement) {
  const master = gsap.timeline({ paused: true });
  svg.querySelectorAll('.flame').forEach((fl, i) => master.add(gsap.to(fl, { scaleY: 1.12, scaleX: 0.95, skewX: rand(-3, 3), transformOrigin: '50% 100%', duration: rand(0.2, 0.34), ease: 'sine.inOut', yoyo: true, repeat: -1 }), i * 0.06));
  return master;
}
