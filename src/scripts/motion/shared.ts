// State the motion sections share. `run` is rebuilt each time a breakpoint changes (gsap.matchMedia re-runs).
import type { Timeline } from './types';

export const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const shared = {
  heroIntro: null as Timeline | null,
  lenis: null as null | { start(): void; stop(): void; destroy(): void },
  lenisTick: null as null | ((t: number) => void)
};

export interface Run {
  phone: boolean;
  tab: boolean;
  desk: boolean;
  fine: boolean;
  /** add a listener that is removed when this run is reverted */
  on: (el: EventTarget, type: string, fn: (e: Event) => void) => void;
  cleanup: (fn: () => void) => void;
}

/** elements that are displayed at this breakpoint (phones hide some decor with .wide) */
export const shown = <T extends Element>(els: T[]) => els.filter((el) => getComputedStyle(el).display !== 'none');
