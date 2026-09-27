// Shared state between the essential scripts and the motion chunk, which may arrive later (or never).
// Essential behaviour never waits for motion: each hook is optional and has a still fallback.

export const root = document.documentElement;
export const $ = <T extends Element = HTMLElement>(sel: string, from: ParentNode = document) => from.querySelector(sel) as T | null;
export const $$ = <T extends Element = HTMLElement>(sel: string, from: ParentNode = document) => [...from.querySelectorAll(sel)] as T[];

export const isPhone = () => matchMedia('(max-width: 599px)').matches;
export const fine = matchMedia('(pointer: fine)').matches;
/** still = the OS asks for reduced motion (unless the guest chose full motion) or the guest chose gentle motion. Set by the head script. */
export const isStill = () => root.classList.contains('still');

export interface Hooks {
  /** build the cover's entrance; returns false if it is too late to play it */
  coverIntro?: () => void;
  /** play the opening; call done when the cloth has fallen */
  open?: (done: () => void) => void;
  /** after the cover is gone: start smooth scroll, refresh triggers, play the hero */
  afterOpen?: () => void;
  bump?: (el: HTMLElement, dir: number) => void;
  tick?: (el: HTMLElement) => void;
  /** play the akshata toss over the RSVP; call show when the thank-you card should appear */
  sent?: (from: HTMLElement, to: HTMLElement, show: () => void) => void;
  knot?: (rite: HTMLElement) => void;
  burst?: (n: number, petals?: boolean) => void;
}

export const app = {
  hooks: {} as Hooks,
  opened: false,
  /** the countdown ticks only while it is on screen (motion keeps this up to date) */
  countdownVisible: true
};
