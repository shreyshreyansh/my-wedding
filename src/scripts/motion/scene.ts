// The opening scene. When the cover opens, the layers settle from a little larger to their places, nearer ones a
// beat later, and the names arrive. Then, as you scroll through the tall section, the toran lifts away, the two names
// turn away from each other and fade while the temple hills climb in front of them, the sun rises, and the layers
// slide apart at their own speeds until the river has moved up and the ghat's steps are underfoot.
// The opening only scales and fades; the scroll only moves and turns, so the two never fight over a property.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { root } from '../app';
import { shared, type Run } from './shared';

export function scene(run: Run) {
  const hero = document.getElementById('hero');
  if (!hero) return;

  shared.heroIntro = gsap.timeline({ paused: root.classList.contains('locked'), defaults: { ease: 'power3.out' } })
    .fromTo('#hero .sc-sky', { scale: 1.08 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0)
    .fromTo('#hero .sc-far', { scale: 1.1 }, { scale: 1, duration: 2.3, ease: 'power2.out' }, 0.08)
    .fromTo('#hero .sc-mid', { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0.16)
    .fromTo('#hero .sc-near', { scale: 1.15 }, { scale: 1, duration: 2.1, ease: 'power2.out' }, 0.24)
    .fromTo('#hero .sc-sun', { scale: 0.86, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 2.6, ease: 'power2.out' }, 0)
    .from('#hero .tr-in', { yPercent: -70, duration: 1.5, ease: 'back.out(1.3)' }, 0.45)
    .from('#hero .h-eyebrow', { opacity: 0, y: 8, duration: 1 }, 0.7)
    .from('#hero .h-who > *, #hero .h-amp', { opacity: 0, y: 14, duration: 1.3, stagger: 0.12 }, 0.75)
    .from('#hero .h-date, #hero .h-venue', { opacity: 0, y: 10, duration: 0.9, stagger: 0.1 }, 1.4);
  if (!document.getElementById('cover')) shared.heroIntro.play();

  /* how far each layer travels as you scroll the section (in % of the screen), farthest least */
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { id: 'scene', trigger: hero, start: 'top top', end: 'bottom bottom', scrub: run.fine ? 0.6 : true } })
    .to('#hero .sc-toran', { yPercent: -115, duration: 0.25 }, 0)
    .to('#hero .h-when, #hero .sc-hint', { opacity: 0, y: 30, duration: 0.14 }, 0)
    .to('#hero .his', { rotation: -28, xPercent: -16, scale: 0.6, opacity: 0.1, duration: 0.55 }, 0.03)
    .to('#hero .her', { rotation: 28, xPercent: 16, scale: 0.6, opacity: 0.1, duration: 0.55 }, 0.03)
    .to('#hero .h-amp', { scale: 0.4, opacity: 0, duration: 0.35 }, 0.03)
    .to('#hero .h-eyebrow', { opacity: 0, duration: 0.2 }, 0)
    .to('#hero .sc-sun', { yPercent: -80, duration: 0.85 }, 0)
    .to('#hero .sc-sky', { yPercent: -4, duration: 1 }, 0)
    .to('#hero .sc-far', { yPercent: -10, duration: 1 }, 0)
    .to('#hero .sc-mid', { yPercent: -26, duration: 1 }, 0)
    .to('#hero .sc-near', { yPercent: -60, duration: 1 }, 0);

  /* the birds, the bells, the clouds and the flames live only while the scene is on screen */
  ScrollTrigger.create({ id: 'scene-live', trigger: hero, start: 'top bottom', end: 'bottom top', toggleClass: { targets: hero, className: 'live' } });
}
