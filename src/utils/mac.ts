export type KernMacFormat = 'colon' | 'dash' | 'dot' | 'plain';

/**
 * MAC address in any common notation (`C82B961A3F00`, `c8:2b:96:1a:3f:00`, `c8-2b-…`, `c82b.961a.3f00`, with spaces)
 * → its 12 hex digits in lower case, or null.
 */
export function parseMac(text: string): string | null {
  const t = text.trim();
  // Separators must be used consistently: groups of 2 (: - space), 4 (.) or none.
  if (!/^([0-9a-f]{2}([:\- ])){5}[0-9a-f]{2}$|^[0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4}$|^[0-9a-f]{12}$/i.test(t)) return null;
  const hex = t.replace(/[:\-. ]/g, '').toLowerCase();
  if (/[:\- ]/.test(t)) {
    const seps = t.match(/[:\- ]/g)!;
    if (new Set(seps).size !== 1) return null;
  }
  return hex;
}

/** 12 hex digits → `C8:2B:96:1A:3F:00` (colon), `C8-2B-…` (dash), `c82b.961a.3f00` (dot) or `C82B961A3F00` (plain). */
export function formatMac(hex: string, format: KernMacFormat = 'colon', upper = true): string {
  const h = upper ? hex.toUpperCase() : hex.toLowerCase();
  if (format === 'plain') return h;
  if (format === 'dot') return h.match(/.{4}/g)!.join('.');
  return h.match(/.{2}/g)!.join(format === 'dash' ? '-' : ':');
}
