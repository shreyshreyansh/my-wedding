// The peacocks meet: a pinned, scrubbed scene. Without motion the page shows its last frame (see gentle.css).
import { gsap } from 'gsap';
import { burst } from './burst';
import type { Run } from './shared';

export function meeting(run: Run) {
  if (!document.getElementById('meeting')) return;
  gsap.set('#meetSvg .f-line', { strokeDasharray: 1 });
  gsap.set('#meeting .cap', { autoAlpha: 0 });
  gsap.set('#meeting .cap:first-child', { autoAlpha: 1 });
  const caps = gsap.utils.toArray<HTMLElement>('#meeting .cap');
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#meeting', start: 'top top', end: () => '+=' + Math.round(innerHeight * (run.phone ? 1.5 : 2.1)),
      pin: '#meeting .stage', scrub: run.fine ? 1.2 : 0.5, anticipatePin: 1, invalidateOnRefresh: true,
      onLeave: () => burst(26)
    }
  })
    .fromTo('#mL', { xPercent: -60 }, { xPercent: 0, duration: 0.35 }, 0)
    .fromTo('#mR', { xPercent: 60 }, { xPercent: 0, duration: 0.35 }, 0)
    .fromTo('#meetSvg .pk-l', { x: -110 }, { x: -24, duration: 0.35 }, 0)
    .fromTo('#meetSvg .pk-r', { x: 110 }, { x: 24, duration: 0.35 }, 0)
    .to('#meetSvg .pk', { keyframes: { y: [0, -4, 0, -4, 0] }, duration: 0.35 }, 0)
    .to(caps[0], { autoAlpha: 0, duration: 0.04 }, 0.18)
    .to(caps[1], { autoAlpha: 1, duration: 0.04 }, 0.2)
    .to('#meetSvg .tail', { autoAlpha: 0, duration: 0.08 }, 0.38)
    .fromTo('#meetSvg .f-line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, duration: 0.14, stagger: 0.012 }, 0.36)
    .fromTo('#meetSvg .f-eye, #meetSvg .f-in', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.1, stagger: 0.006 }, 0.42)
    .to(caps[1], { autoAlpha: 0, duration: 0.04 }, 0.37)
    .to(caps[2], { autoAlpha: 1, duration: 0.04 }, 0.39)
    .to('#meetSvg .pk-l', { x: 0, duration: 0.15 }, 0.7)
    .to('#meetSvg .pk-r', { x: 0, duration: 0.15 }, 0.7)
    .fromTo('#meetSvg .bead', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.08, stagger: 0.008 }, 0.76)
    .to(caps[2], { autoAlpha: 0, duration: 0.04 }, 0.72)
    .to(caps[3], { autoAlpha: 1, duration: 0.04 }, 0.74)
    .fromTo('#meeting .write', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.14, stagger: 0.03 }, 0.86);
}
