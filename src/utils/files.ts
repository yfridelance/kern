const UNITS: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };

/** `16777216`, `"16MB"`, `"500 KB"` → bytes; null when empty or invalid. */
export function parseSize(v: number | string | undefined | null): number | null {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'number') return v > 0 ? v : null;
  const m = /^\s*(\d+(?:[.,]\d+)?)\s*(b|kb|mb|gb)?\s*$/i.exec(v);
  if (!m) return null;
  return Math.round(Number(m[1].replace(',', '.')) * UNITS[(m[2] ?? 'b').toLowerCase()]);
}

/** Bytes → „512 B“, „1.4 MB“ in the locale. */
export function formatSize(bytes: number, locale?: string): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: i === 0 ? 0 : 1 }).format(n)} ${units[i]}`;
}

/** Whether a file matches an `accept` list like `.bin,.json,image/*,application/pdf` (empty accepts all). */
export function accepts(file: { name: string; type: string }, accept?: string): boolean {
  const rules = (accept ?? '').split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type ?? '').toLowerCase();
  return rules.some((r) => (r.startsWith('.') ? name.endsWith(r) : r.endsWith('/*') ? type.startsWith(r.slice(0, -1)) : type === r));
}
