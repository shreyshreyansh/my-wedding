// The Mangalashtak verse, one span per word so it can light up word by word (never split into letters:
// Devanagari conjuncts would break).
export function verse(lines: readonly string[], rivers: readonly string[]) {
  return lines.map((line) =>
    '<span class="ln">' + line.split(' ').map((w) => '<span class="vw' + (rivers.includes(w) ? ' river' : '') + '">' + w + '</span>').join('') + '</span>'
  ).join('');
}
