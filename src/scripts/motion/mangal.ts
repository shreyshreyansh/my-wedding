// The blessing: reveals, the verse lit word by word, drifting specks; then the curtain and the RSVP heading.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { app } from '../app';
import { burst } from './burst';
import { blessingLoop } from './loops';
import { rand } from './shared';

export function mangal() {
  gsap.utils.toArray<HTMLElement>('#invite .reveal, #mangal .reveal, #rsvp .reveal').forEach((el) => {
    gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  if (document.getElementById('verse')) {
    gsap.fromTo('#verse .vw', { opacity: 0.2, y: 6 }, { opacity: 1, y: 0, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '#verse', start: 'top 78%', end: 'bottom 42%', scrub: true } });
    ScrollTrigger.create({ trigger: '#savdhan', start: 'top 82%', once: true, onEnter: () => burst(24) });
    const specks = gsap.utils.toArray<HTMLElement>('#specks .speck').map((s, i) => gsap.timeline({ repeat: -1, delay: (i % 7) * 1.1, paused: true })
      .to(s, { opacity: 0.75, duration: 1.6, ease: 'sine.inOut' })
      .to(s, { y: rand(-40, -24), x: rand(-14, 14), duration: 5 + (i % 5) * 1.4, ease: 'sine.inOut' }, 0)
      .to(s, { opacity: 0, duration: 1.8, ease: 'sine.inOut' }, '-=1.8'));
    ScrollTrigger.create({ trigger: '#mangal', start: 'top bottom', end: 'bottom top', onToggle: (s) => specks.forEach((t) => (s.isActive ? t.play() : t.pause())) });
  }
}

/** The countdown ticks only while visible; the RSVP slides over it like a curtain. */
export function curtain() {
  if (!document.getElementById('rsvp')) return;
  ScrollTrigger.create({ trigger: '.curtain', start: 'top bottom', endTrigger: '#rsvp', end: 'top top', onToggle: (s) => (app.countdownVisible = s.isActive) });
  gsap.from('#rsvp h2 .ch', { yPercent: 70, rotationX: -50, transformPerspective: 400, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.03, scrollTrigger: { trigger: '#rsvp h2', start: 'top 88%', once: true } });
  const thali = document.querySelector<SVGElement>('#rsvp .med svg');
  if (thali) {
    const loop = blessingLoop(thali);
    ScrollTrigger.create({ trigger: '#rsvp .med', start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? loop.play() : loop.pause()) });
  }
}
