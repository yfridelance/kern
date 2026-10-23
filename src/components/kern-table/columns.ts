import type { KernColumnPin, KernTableColumn } from './sort';

/**
 * One column in a column state: the array order is the column order. Plain data, so it can be stored as JSON.
 * Columns missing from a state are shown at their place in `columns`; unknown keys are ignored.
 */
export interface KernColumnState {
  key: string;
  hidden?: boolean;
  pinned?: KernColumnPin;
}

/**
 * The complete column state for `columns`: every column once, in order (pinned to the start first, pinned to the end
 * last), with unknown and repeated keys dropped and new columns at their place in `columns`. Columns that can't be
 * hidden are shown, and hidden ones are shown again (from the start) until `minVisible` columns are visible.
 * Without `state` it is the default state from `columns[].hidden` and `columns[].pinned`.
 */
export function resolveColumnState(columns: KernTableColumn[], state?: KernColumnState[] | null, minVisible = 1): KernColumnState[] {
  const known = new Map(columns.map((c) => [c.key, c]));
  const list: KernColumnState[] = [];
  const seen = new Set<string>();
  const add = (s: KernColumnState, at = list.length) => {
    const column = known.get(s.key)!;
    const entry: KernColumnState = { key: s.key };
    if (s.hidden && column.hideable !== false) entry.hidden = true;
    if (s.pinned === 'start' || s.pinned === 'end') entry.pinned = s.pinned;
    list.splice(at, 0, entry);
    seen.add(s.key);
  };
  for (const s of Array.isArray(state) ? state : []) {
    if (s && typeof s.key === 'string' && known.has(s.key) && !seen.has(s.key)) add(s);
  }
  // Columns the state doesn't know (e.g. added by a newer app version): after the column before them in `columns`.
  columns.forEach((c, i) => {
    if (seen.has(c.key)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const k = list.findIndex((s) => s.key === columns[j].key);
      if (k >= 0) {
        at = k + 1;
        break;
      }
    }
    add(c, at);
  });
  const ordered = [...list.filter((s) => s.pinned === 'start'), ...list.filter((s) => !s.pinned), ...list.filter((s) => s.pinned === 'end')];
  let visible = ordered.filter((s) => !s.hidden).length;
  for (const s of ordered) {
    if (visible >= minVisible) break;
    if (s.hidden) {
      delete s.hidden;
      visible++;
    }
  }
  return ordered;
}
