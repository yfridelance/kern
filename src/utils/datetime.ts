/** A parsed date or point in time. `dateOnly` marks a calendar date (`YYYY-MM-DD`) without time zone. */
export interface KernDateValue {
  date: Date;
  dateOnly: boolean;
}

export type KernDateFormat = 'short' | 'medium' | 'long' | 'full';

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
const DURATION = /^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

/** Explicit locale, else `<html lang>`, else the browser language. */
export function resolveLocale(locale?: string): string | undefined {
  if (locale) return locale;
  if (typeof document !== 'undefined' && document.documentElement?.lang) return document.documentElement.lang;
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  return undefined;
}

/**
 * Accepts an ISO date (`2026-10-19`, local calendar day), an ISO 8601 point in time, epoch milliseconds or a Date.
 * Returns null for empty or invalid input.
 */
export function parseDateTime(value: string | number | Date | undefined | null): KernDateValue | null {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : { date: value, dateOnly: false };
  if (typeof value === 'number') return parseDateTime(new Date(value));
  const s = value.trim();
  const d = DATE_ONLY.exec(s);
  if (d) {
    const date = new Date(+d[1], +d[2] - 1, +d[3]);
    // Reject overflow such as 2026-02-31.
    if (date.getMonth() !== +d[2] - 1) return null;
    return { date, dateOnly: true };
  }
  if (/^-?\d+$/.test(s)) return parseDateTime(Number(s));
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : { date: new Date(t), dateOnly: false };
}

/** `HH:mm[:ss]` → seconds since midnight, or null. */
export function parseTime(value: string | undefined | null): number | null {
  const m = value ? TIME_ONLY.exec(value.trim()) : null;
  if (!m) return null;
  const [h, min, s] = [+m[1], +m[2], +(m[3] ?? 0)];
  if (h > 23 || min > 59 || s > 59) return null;
  return h * 3600 + min * 60 + s;
}

/** `YYYY-MM-DD` for a calendar date, else the full ISO string (for `<time datetime>`). */
export function toIso({ date, dateOnly }: KernDateValue): string {
  if (!dateOnly) return date.toISOString();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export interface FormatDateOptions {
  format?: KernDateFormat;
  /** Also show the time (ignored for calendar dates). */
  time?: boolean;
  locale?: string;
  timeZone?: string;
}

export function formatDate(v: KernDateValue, opts: FormatDateOptions = {}): string {
  const { format = 'medium', time = false, timeZone } = opts;
  const withTime = time && !v.dateOnly;
  return new Intl.DateTimeFormat(resolveLocale(opts.locale), {
    dateStyle: format,
    timeStyle: withTime ? 'short' : undefined,
    // A calendar date is the same day everywhere; shifting it to another zone would change the day.
    timeZone: v.dateOnly ? undefined : timeZone,
  }).format(v.date);
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['second', 60],
  ['minute', 60],
  ['hour', 24],
  ['day', 30],
  ['month', 12],
  ['year', Infinity],
];

/** Largest sensible unit for a distance, e.g. -180 s → [-3, 'minute']. Calendar dates count whole days. */
export function relativeParts(v: KernDateValue, now: number): [number, Intl.RelativeTimeFormatUnit] {
  let amount: number;
  let i = 0;
  if (v.dateOnly) {
    const today = new Date(now);
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    amount = Math.round((v.date.getTime() - start.getTime()) / 86_400_000);
    i = 3;
  } else {
    amount = (v.date.getTime() - now) / 1000;
  }
  for (; i < UNITS.length; i++) {
    const [unit, size] = UNITS[i];
    if (Math.abs(amount) < size) return [Math.round(amount), unit];
    amount /= size;
  }
  return [Math.round(amount), 'year'];
}

export function formatRelative(v: KernDateValue, now: number, locale?: string): string {
  const [amount, unit] = relativeParts(v, now);
  return new Intl.RelativeTimeFormat(resolveLocale(locale), { numeric: 'auto', style: 'short' }).format(amount, unit);
}

/** Milliseconds until a relative text should be refreshed. */
export function relativeRefresh(v: KernDateValue, now: number): number {
  const diff = Math.abs(v.date.getTime() - now);
  if (diff < 60_000) return 1_000;
  if (diff < 3_600_000) return 10_000;
  if (diff < 86_400_000) return 60_000;
  return 3_600_000;
}

/** Time of day: `HH:mm[:ss]` or a point in time. */
export interface FormatTimeOptions {
  seconds?: boolean;
  hour12?: boolean;
  locale?: string;
  timeZone?: string;
}

export function formatTime(value: string | number | Date, opts: FormatTimeOptions = {}): string | null {
  const secs = typeof value === 'string' ? parseTime(value) : null;
  let date: Date;
  let timeZone = opts.timeZone;
  if (secs !== null) {
    date = new Date(1970, 0, 1, Math.floor(secs / 3600), Math.floor(secs / 60) % 60, secs % 60);
    timeZone = undefined;
  } else {
    const v = parseDateTime(value);
    if (!v || v.dateOnly) return null;
    date = v.date;
  }
  return new Intl.DateTimeFormat(resolveLocale(opts.locale), {
    hour: '2-digit',
    minute: '2-digit',
    second: opts.seconds ? '2-digit' : undefined,
    hour12: opts.hour12,
    timeZone,
  }).format(date);
}

export interface KernDuration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

const DURATION_KEYS = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'] as const;

/**
 * ISO 8601 duration (`PT1H23M`) or a number of seconds (`5025`, split into days/hours/minutes/seconds).
 * Returns null for invalid input.
 */
export function parseDuration(value: string | number | undefined | null): KernDuration | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(value.trim())) {
    let s = Math.round(Number(value));
    if (!Number.isFinite(s) || s < 0) return null;
    const days = Math.floor(s / 86_400);
    s -= days * 86_400;
    const hours = Math.floor(s / 3600);
    s -= hours * 3600;
    const minutes = Math.floor(s / 60);
    return { days, hours, minutes, seconds: s - minutes * 60 };
  }
  const m = DURATION.exec(value.trim());
  if (!m || value.trim() === 'P' || value.trim().endsWith('T')) return null;
  const d: KernDuration = {};
  DURATION_KEYS.forEach((k, i) => {
    if (m[i + 1] !== undefined) d[k] = Number(m[i + 1]);
  });
  return d;
}

/** ISO 8601 form of a duration (for `<time datetime>`). */
export function durationToIso(d: KernDuration): string {
  const date = `${d.years ? `${d.years}Y` : ''}${d.months ? `${d.months}M` : ''}${d.weeks ? `${d.weeks}W` : ''}${d.days ? `${d.days}D` : ''}`;
  const time = `${d.hours ? `${d.hours}H` : ''}${d.minutes ? `${d.minutes}M` : ''}${d.seconds ? `${d.seconds}S` : ''}`;
  return date || time ? `P${date}${time ? `T${time}` : ''}` : 'PT0S';
}

/** Non-zero parts in the locale, e.g. „1 Std., 23 Min.“; a zero duration shows „0 Sek.“. */
export function formatDuration(d: KernDuration, locale?: string): string {
  const parts = Object.fromEntries(DURATION_KEYS.filter((k) => d[k]).map((k) => [k, d[k]])) as KernDuration;
  const loc = resolveLocale(locale);
  const empty = !Object.keys(parts).length;
  if (empty) parts.seconds = 0;
  const DF = (Intl as unknown as { DurationFormat?: new (l?: string, o?: object) => { format(d: KernDuration): string } }).DurationFormat;
  if (DF) return new DF(loc, { style: 'short', secondsDisplay: empty ? 'always' : 'auto' }).format(parts);
  // Fallback for browsers without Intl.DurationFormat.
  return (Object.keys(parts) as (keyof KernDuration)[])
    .map((k) => new Intl.NumberFormat(loc, { style: 'unit', unit: k.slice(0, -1), unitDisplay: 'short' }).format(parts[k]!))
    .join(', ');
}

type Tick = () => void;
const subscribers = new Set<Tick>();
let interval: ReturnType<typeof setInterval> | undefined;

/** One shared 1 s timer for all relative displays; returns the unsubscribe function. */
export function onTick(fn: Tick): () => void {
  subscribers.add(fn);
  interval ??= setInterval(() => subscribers.forEach((s) => s()), 1000);
  return () => {
    subscribers.delete(fn);
    if (!subscribers.size && interval) {
      clearInterval(interval);
      interval = undefined;
    }
  };
}
