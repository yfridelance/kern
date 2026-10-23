import type { IconName } from './icon-names';

/** One entry of a kern-command-palette: a page, a device or an action. */
export interface KernCommandItem {
  /** Stable ID, reported by `kernSelect`. */
  id: string;
  label: string;
  /** Second line, e.g. model and IP of a device or the path of a page. */
  description?: string;
  /** Heading the entry is listed under, e.g. «Pages», «Devices», «Actions». */
  group?: string;
  icon?: IconName;
  /** Further search terms that are not shown, e.g. an IP, a MAC or synonyms. */
  keywords?: string[];
  /** Shown, but cannot be chosen. */
  disabled?: boolean;
}

/** An entry that matches the query, with the parts of its label to highlight. */
export interface CommandHit {
  item: KernCommandItem;
  /** Position in `items`. */
  index: number;
  /** Lower is better. */
  score: number;
  /** `[start, end)` ranges in `item.label`, sorted and not overlapping. */
  ranges: [number, number][];
}

/** Hits listed under one heading (`label` is empty for entries without a group). */
export interface CommandGroup {
  label: string;
  hits: CommandHit[];
}

const MARKS = /[\u0300-\u036f]/g;

/**
 * One character in lower case without diacritics. Per character, so label and query fold the same way and positions
 * map back to the label; the final sigma «ς» (which a whole-text lower-casing would produce) becomes «σ».
 */
function foldChar(c: string): string {
  return c.normalize('NFD').replace(MARKS, '').toLowerCase().replace(/ς/g, 'σ');
}

/** The folded text and, per folded character, the index of the character in `text` it came from. */
function foldWithMap(text: string): { folded: string; map: number[] } {
  let folded = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const part = foldChar(text[i]);
    folded += part;
    for (let n = 0; n < part.length; n++) map.push(i);
  }
  return { folded, map };
}

/** Lower case without diacritics, so «kuche» finds «Küche». */
export function foldText(text: string): string {
  return foldWithMap(text).folded;
}

/** Search words of a query: folded, split at whitespace. */
export function queryTokens(query: string): string[] {
  return foldText(query).split(/\s+/).filter(Boolean);
}

const isWordChar = (c: string | undefined) => !!c && /[\p{L}\p{N}]/u.test(c);

/** Best occurrence of `token` in the folded label: start (0), word start (1), anywhere (2); `undefined` when absent. */
function labelMatch(folded: string, token: string): { at: number; score: number } | undefined {
  let best: { at: number; score: number } | undefined;
  for (let at = folded.indexOf(token); at >= 0; at = folded.indexOf(token, at + 1)) {
    const score = at === 0 ? 0 : isWordChar(folded[at - 1]) ? 2 : 1;
    if (!best || score < best.score) best = { at, score };
    if (score === 0) break;
  }
  return best;
}

/**
 * How well `item` matches the search words: every word must occur in the label, a keyword or the group (case and
 * diacritics ignored). Label matches rank first (start before word start before anywhere), then keywords, then the
 * group. Without words every item matches with score 0. `undefined` when it does not match.
 */
export function matchCommand(item: KernCommandItem, index: number, tokens: string[]): CommandHit | undefined {
  const { folded, map } = foldWithMap(item.label ?? '');
  const keywords = (item.keywords ?? []).map(foldText);
  const group = foldText(item.group ?? '');
  let score = 0;
  const raw: [number, number][] = [];
  for (const token of tokens) {
    const inLabel = labelMatch(folded, token);
    if (inLabel) {
      score += inLabel.score;
      raw.push([map[inLabel.at], map[inLabel.at + token.length - 1] + 1]);
    } else if (keywords.some((k) => k.includes(token))) {
      score += 3;
    } else if (group.includes(token)) {
      score += 4;
    } else {
      return undefined;
    }
  }
  return { item, index, score, ranges: mergeRanges(raw) };
}

/** Ranges of `label` to highlight for the search words that occur in it (the others are ignored). */
export function labelRanges(label: string, tokens: string[]): [number, number][] {
  const { folded, map } = foldWithMap(label);
  const raw: [number, number][] = [];
  for (const token of tokens) {
    const m = labelMatch(folded, token);
    if (m) raw.push([map[m.at], map[m.at + token.length - 1] + 1]);
  }
  return mergeRanges(raw);
}

/** Sorted, overlapping or touching ranges joined. */
function mergeRanges(ranges: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  for (const [a, b] of [...ranges].sort((x, y) => x[0] - y[0])) {
    const last = out[out.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

/**
 * Items grouped in the order their groups first appear. With `filter`, only matching items are kept and each group
 * is sorted by score (ties keep the given order); without, all items stay in their order and only the label
 * highlights are computed (results already filtered by a server).
 */
export function searchCommands(items: KernCommandItem[], query: string, filter = true): CommandGroup[] {
  const tokens = queryTokens(query);
  const groups = new Map<string, CommandHit[]>();
  items.forEach((item, index) => {
    if (!item) return;
    const hit = matchCommand(item, index, tokens) ?? (filter ? undefined : { item, index, score: 0, ranges: labelRanges(item.label ?? '', tokens) });
    if (!hit) return;
    const key = item.group ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(hit);
  });
  return [...groups].map(([label, hits]) => ({ label, hits: filter && tokens.length ? hits.sort((a, b) => a.score - b.score || a.index - b.index) : hits }));
}
