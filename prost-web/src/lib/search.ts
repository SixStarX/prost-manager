/** Utilitários de busca — normalização tolerante a acentos e separadores. */

/** Remove acentos e coloca em minúsculas: "José" → "jose". */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/** Mantém apenas letras e números: "ABC-1D23" → "abc1d23". */
export function alnum(value: string): string {
  return normalize(value).replace(/[^a-z0-9]/g, '');
}

/**
 * Testa se `haystack` corresponde a `query`, tolerando acentos e separadores.
 * Todos os termos da busca precisam casar (AND), em qualquer ordem.
 * Ex.: "abc-1234" casa com a placa "ABC1234"; "jose civic" casa com dono + modelo.
 */
export function matches(haystack: string, query: string): boolean {
  const normHay = normalize(haystack);
  const alnumHay = alnum(haystack);
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => normHay.includes(term) || alnumHay.includes(alnum(term)));
}

/**
 * Divide `text` nos trechos que casam com `query` (para destaque visual).
 * Retorna segmentos marcados como correspondentes ou não.
 */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const term = normalize(query.trim().split(/\s+/)[0] ?? '');
  if (!term) return [{ text, match: false }];

  const normText = normalize(text);
  const parts: { text: string; match: boolean }[] = [];
  let i = 0;
  let idx = normText.indexOf(term, i);
  while (idx !== -1) {
    if (idx > i) parts.push({ text: text.slice(i, idx), match: false });
    parts.push({ text: text.slice(idx, idx + term.length), match: true });
    i = idx + term.length;
    idx = normText.indexOf(term, i);
  }
  if (i < text.length) parts.push({ text: text.slice(i), match: false });
  return parts;
}
