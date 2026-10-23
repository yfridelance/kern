import { parseDateTime } from '../../utils/datetime';

/** Severity of a log entry, from least to most severe. */
export type KernLogLevel = 'debug' | 'info' | 'warn' | 'error';

export const LOG_LEVELS: KernLogLevel[] = ['debug', 'info', 'warn', 'error'];

/** One log entry. All texts are shown as text, never as HTML. */
export interface KernLogEntry {
  /** Stable, unique key: keeps the row, its open details and the focus through updates. */
  id: string | number;
  /** Point in time: ISO 8601 string, epoch milliseconds or Date. */
  time: string | number | Date;
  /** Severity; other strings are shown as given and filtered like `info`. */
  level: KernLogLevel | string;
  message: string;
  /** Origin, e.g. a device, topic or service; filterable. */
  source?: string;
  /** Extra text shown on demand (stack trace, payload); objects are shown as JSON. */
  details?: string | object;
}

/** The filter state of a kern-log: all criteria combine; several levels or sources are alternatives. */
export interface KernLogFilter {
  query: string;
  levels: string[];
  sources: string[];
}

/** Level as filtered: unknown levels count as `info`. */
export function levelOf(entry: KernLogEntry): KernLogLevel {
  const level = String(entry.level ?? '').toLowerCase();
  return (LOG_LEVELS as string[]).includes(level) ? (level as KernLogLevel) : 'info';
}

/** Details as text: strings as given, everything else as indented JSON. */
export function detailsText(entry: KernLogEntry): string {
  const d = entry.details;
  if (d == null || d === '') return '';
  if (typeof d === 'string') return d;
  try {
    return JSON.stringify(d, null, 2);
  } catch {
    return String(d);
  }
}

/** Point in time as ISO 8601, or the value as given when it is no valid point in time. */
export function isoTime(entry: KernLogEntry): string {
  const v = parseDateTime(entry.time);
  return v && !v.dateOnly ? v.date.toISOString() : String(entry.time ?? '');
}

/** A predicate for the filter: search (case-insensitive, in message, source and details) and levels and sources. */
export function logFilter({ query, levels, sources }: KernLogFilter): (entry: KernLogEntry) => boolean {
  const q = query.trim().toLowerCase();
  const lv = new Set(levels.map((l) => l.toLowerCase()));
  const src = new Set(sources);
  return (entry) =>
    (!lv.size || lv.has(levelOf(entry))) &&
    (!src.size || src.has(entry.source ?? '')) &&
    (!q || [entry.message, entry.source, detailsText(entry)].some((t) => !!t && String(t).toLowerCase().includes(q)));
}

/** One entry as a text line (`<ISO time> <LEVEL> [source] message`), details indented below. */
export function entryText(entry: KernLogEntry): string {
  const head = [isoTime(entry), String(entry.level ?? '').toUpperCase(), entry.source ? `[${entry.source}]` : '', String(entry.message ?? '')]
    .filter(Boolean)
    .join(' ');
  const details = detailsText(entry);
  return details ? `${head}\n${details.replace(/^/gm, '  ')}` : head;
}

/**
 * `text` split around the matches of `query` (case-insensitive): odd indexes are matches. One part when there is no
 * match, or when lower-casing changes the length (some Unicode letters), so indexes would not fit.
 */
export function splitMatches(text: string, query: string): string[] {
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  if (!q || lower.length !== text.length) return [text];
  const parts: string[] = [];
  let from = 0;
  for (let at = lower.indexOf(q); at !== -1; at = lower.indexOf(q, at + q.length)) {
    parts.push(text.slice(from, at), text.slice(at, at + q.length));
    from = at + q.length;
  }
  parts.push(text.slice(from));
  return parts;
}
