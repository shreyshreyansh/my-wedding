// The names arrive: halves slide in, the medallion settles, Latin letters rise, Devanagari is written in.
// Feathers drift at several depths, with scroll parallax and, on a mouse, pointer depth.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { root, $$ } from '../app';
import { rand, shared, shown, type Run } from './shared';

export function hero(run: Run) {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const blur = run.desk && run.fine;
  const floaters = shown($$('#hero .fl'));
  shared.heroIntro = gsap.timeline({ paused: root.classList.contains('locked'), defaults: { ease: 'power3.out' } })
    .from('#hero .half.l', { xPercent: -100, duration: 0.9 })
    .from('#hero .half.r', { xPercent: 100, duration: 0.9 }, '<')
    .from('#hero .med svg', { scale: 0.9, autoAlpha: 0, duration: 0.8, transformOrigin: '50% 50%' }, '-=0.5')
    .from('#hero .pk-l', { x: -40, duration: 1 }, '<0.1')
    .from('#hero .pk-r', { x: 40, duration: 1 }, '<0.08')
    .fromTo('#hero .letters .ch', Object.assign({ yPercent: 70, rotationX: -50, transformPerspective: 400, autoAlpha: 0 }, blur ? { filter: 'blur(8px)' } : {}), Object.assign({ yPercent: 0, rotationX: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.045 }, blur ? { filter: 'blur(0px)' } : {}), '-=0.7')
    .from('#hero .amp', { scale: 0, autoAlpha: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.5')
    .from('#hero .write', { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.1, ease: 'power2.inOut', stagger: 0.12 }, '-=0.4')
    .from('#hero .hero-date', { y: 12, autoAlpha: 0, duration: 0.6 }, '-=0.6')
    .from(floaters, { autoAlpha: 0, duration: 1.2, stagger: 0.06 }, 0.3);
  if (!document.getElementById('cover')) shared.heroIntro.play();

  const drift = floaters.map((el, i) => gsap.to(el.firstChild, { y: rand(-14, 14), x: rand(-8, 8), rotation: rand(-12, 12), duration: rand(3, 6), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.2, paused: true }));
  const crest = gsap.to('#hero .crest', { y: -1.6, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.5, paused: true });
  ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => [...drift, crest].forEach((t) => (s.isActive ? t.play() : t.pause())) });
  floaters.forEach((el) => {
    const d = Number(el.dataset.depth);
    gsap.to(el, { y: () => -innerHeight * 0.35 * d, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  });
  gsap.to('#hero .med', { y: () => innerHeight * 0.08, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  if (run.fine) {
    const movers = floaters.map((el) => ({ d: Number(el.dataset.depth), x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }) }));
    const medX = gsap.quickTo('#hero .med svg', 'x', { duration: 1, ease: 'power3.out' });
    run.on(hero, 'pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const nx = ((e as PointerEvent).clientX - r.left) / r.width - 0.5;
      movers.forEach((m) => m.x(nx * 60 * m.d));
      medX(nx * -10);
    });
  }
}
