// The names arrive as the antarpat falls: each name wipes in, the & settles on its hairline, the details rise.
// On scroll the names drift apart a little, his to the left and hers to the right, as the page moves on.
import { gsap } from 'gsap';
import { root } from '../app';
import { shared, type Run } from './shared';

export function hero(run: Run) {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const wipe = { clipPath: 'inset(-25% 100% -25% -5%)' };
  shared.heroIntro = gsap.timeline({ paused: root.classList.contains('locked'), defaults: { ease: 'power3.out' } })
    .from('#hero .h-eyebrow', { y: 10, autoAlpha: 0, duration: 0.7 })
    .fromTo('#hero .h-who .nm', wipe, { clipPath: 'inset(-25% -5% -25% -5%)', duration: 1.1, ease: 'power2.inOut', stagger: 0.35 }, 0.1)
    .from('#hero .h-amp i', { scaleX: 0, duration: 0.8, ease: 'power2.inOut' }, 0.45)
    .from('#hero .h-amp span', { scale: 0.5, autoAlpha: 0, rotation: -12, duration: 0.7, ease: 'back.out(2)' }, 0.55)
    .from('#hero .h-sub', { y: 10, autoAlpha: 0, duration: 0.7, stagger: 0.35 }, 0.6)
    .from('#hero .h-when > *', { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 1.0);
  if (!document.getElementById('cover')) shared.heroIntro.play();

  const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('#hero .his', { xPercent: run.desk ? -6 : -10, ease: 'none', scrollTrigger: st });
  gsap.to('#hero .her', { xPercent: run.desk ? 6 : 10, ease: 'none', scrollTrigger: st });
  gsap.to('#hero .h-in', { autoAlpha: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: 'center top', end: 'bottom top', scrub: true } });
}
