export type KernSortDirection = 'asc' | 'desc';

/** A column of a `kern-table` built from data (`columns` + `rows`). */
export interface KernTableColumn<T = any> {
  /** Field in the row; also `key` in `kernSort`. */
  key: string;
  label: string;
  sortable?: boolean;
  sorted?: KernSortDirection;
  /** `end` right-aligns like `class="num"`. */
  align?: 'start' | 'end';
  /** Monospace like `td.mono` (IP, MAC, IDs). */
  mono?: boolean;
  /** CSS width of the column. */
  width?: string;
  /** Cell content: a Node (e.g. a `kern-signal`) or text. Default: `row[key]`, `–` when empty. */
  cell?: (row: T, index: number) => Node | string;
  /** Value to sort by. Default: `row[key]`. */
  sortValue?: (row: T) => string | number | null | undefined;
}

/** Empty, or a dash standing for “no value”. */
export function isBlank(v: unknown): boolean {
  return v === null || v === undefined || /^[-–—]?$/.test(String(v).trim());
}

function toNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  return s === '' ? NaN : Number(s);
}

/** Stable sort by a value: numbers numerically, otherwise with the collator; blank values last in both directions. */
export function sortByValue<T>(items: T[], value: (item: T) => unknown, direction: KernSortDirection, collator: Intl.Collator): T[] {
  const sign = direction === 'asc' ? 1 : -1;
  const keyed = items.map((item) => ({ item, v: value(item) }));
  keyed.sort((a, b) => {
    const ba = isBlank(a.v);
    const bb = isBlank(b.v);
    if (ba || bb) return ba === bb ? 0 : ba ? 1 : -1;
    const na = toNumber(a.v);
    const nb = toNumber(b.v);
    return sign * (Number.isFinite(na) && Number.isFinite(nb) ? na - nb : collator.compare(String(a.v).trim(), String(b.v).trim()));
  });
  return keyed.map((k) => k.item);
}
