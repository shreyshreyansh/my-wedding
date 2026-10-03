// Types for src/data/wedding.ts, and the todo() placeholder that the STRICT build refuses to ship.

export type Lang = 'en' | 'mr' | 'hi';
export type EventId = 'haldi' | 'sangeet' | 'shaadi';
export type Tri = Record<Lang, string>;

export interface WeddingEvent {
  id: EventId;
  name: Tri;
  /** the Devanagari names shown under the title, each with its lang */
  dn: { lang: 'mr' | 'hi'; text: string }[];
  story: string;
  /** ISO 8601 with the +05:30 offset */
  start: string;
  end: string;
  when: string;
  /** short form for the RSVP rows, e.g. "Tue 8 Dec · 12 noon" */
  short: string;
  dress: string;
  swatch: { bg: string; edge: string };
}

/** One line of the invitation card. `k` picks the typography. */
export interface Block {
  k: 'invocation' | 'deity' | 'lead' | 'name' | 'parents' | 'join' | 'shubh' | 'when' | 'where' | 'request' | 'shloka' | 'note' | 'sign' | 'manuhar' | 'manuhar-by';
  t: string;
}

const missing = new Set<string>();

/** Content the family still has to supply. Shown as ⟦label⟧ in previews; STRICT=1 builds fail while any remain. */
export function todo(label: string): string {
  missing.add(label);
  return '⟦' + label + '⟧';
}

export function missingContent(): string[] {
  return [...missing];
}

export const isStrict = () => (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.STRICT === '1';

export function assertComplete() {
  const left = missingContent();
  if (isStrict() && left.length) {
    throw new Error('STRICT build: ' + left.length + ' pieces of content are missing:\n  - ' + left.join('\n  - ') + '\nFill them in src/data/wedding.ts.');
  }
}
