// The blessing: reveals, and the verse lit word by word as it scrolls past; then the curtain and the RSVP.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { app } from '../app';
import { burst } from './burst';

export function mangal() {
  gsap.utils.toArray<HTMLElement>('#invite .reveal, #mangal .reveal, #rsvp .reveal').forEach((el) => {
    gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  if (document.getElementById('verse')) {
    for (const id of ['#verse', '#verse2']) if (document.querySelector(id)) gsap.fromTo(id + ' .vw', { opacity: 0.18, y: 6 }, { opacity: 1, y: 0, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: id, start: 'top 78%', end: 'bottom 42%', scrub: true } });
    /* the leaves of the torans sway only while the section is on screen */
    ScrollTrigger.create({ trigger: '#mangal', start: 'top bottom', end: 'bottom top', toggleClass: { targets: '#mangal', className: 'live' } });
    ScrollTrigger.create({ trigger: '#savdhan', start: 'top 82%', once: true, onEnter: () => burst(24) });
  }
}

/** The countdown ticks only while visible; the RSVP slides over it like a curtain. */
export function curtain() {
  if (!document.getElementById('rsvp')) return;
  ScrollTrigger.create({ trigger: '.curtain', start: 'top bottom', endTrigger: '#rsvp', end: 'top top', onToggle: (s) => (app.countdownVisible = s.isActive) });
  gsap.from('#count .unit', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '#count', start: 'top 80%', once: true } });
}
