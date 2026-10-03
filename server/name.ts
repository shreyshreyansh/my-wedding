// ?name=Rahul — a guest's own name, put into the page by the edge so it greets them. Anyone can type anything into a
// link, so keep only what a name is made of (letters in any script, their marks, spaces and . ' ’ - &), at most
// 40 characters, and capitalise each word typed in lower case. It is only ever put into the page as text.
export function cleanName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.normalize('NFC').replace(/[^\p{L}\p{M}\s.'’&-]/gu, ' ').replace(/\s+/g, ' ').trim();
  s = [...s].slice(0, 40).join('').trim();
  if (!/\p{L}/u.test(s)) return null;
  return s.replace(/(^|[\s-])(\p{Ll})/gu, (_, a: string, b: string) => a + b.toUpperCase());
}

/** Names in Devanagari get lang="hi", so screen readers and fonts treat them right. */
export const isDevanagari = (s: string) => /[ऀ-ॿ]/.test(s);
