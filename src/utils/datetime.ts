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

/* Calendar arithmetic on ISO dates (`YYYY-MM-DD`, local days). ISO dates compare correctly as strings. */

/** `YYYY-MM-DD` of a local Date. */
export function isoDate(date: Date): string {
  return toIso({ date, dateOnly: true });
}

/** Local Date of an ISO date, or null. */
export function fromIsoDate(iso: string | undefined | null): Date | null {
  const v = iso ? parseDateTime(iso) : null;
  return v?.dateOnly ? v.date : null;
}

export function todayIso(now = Date.now()): string {
  return isoDate(new Date(now));
}

export function addDays(iso: string, n: number): string {
  const d = fromIsoDate(iso)!;
  return isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

/** Same day n months later, clamped to the month's end (31.01. + 1 → 28./29.02.). */
export function addMonths(iso: string, n: number): string {
  const d = fromIsoDate(iso)!;
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return isoDate(new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last)));
}

/** Clamp an ISO date to optional bounds. */
export function clampIso(iso: string, min?: string, max?: string): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/** First day of the week, 0 = Sunday … 6 = Saturday; from `Intl.Locale` week info, else Monday. */
export function firstDayOfWeek(locale?: string): number {
  try {
    const l = new Intl.Locale(resolveLocale(locale) ?? 'de') as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const day = (l.getWeekInfo?.() ?? l.weekInfo)?.firstDay;
    if (day) return day % 7;
  } catch {
    // invalid locale → default
  }
  return 1;
}

/** 6 weeks of ISO dates covering a month (month 0–11), starting on `firstDay`. */
export function monthGrid(year: number, month: number, firstDay: number): string[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - firstDay + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => isoDate(new Date(year, month, 1 - offset + i)));
}

/** ISO 8601 week number. */
export function isoWeek(iso: string): number {
  const d = fromIsoDate(iso)!;
  const thursday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const jan1 = new Date(thursday.getFullYear(), 0, 1);
  return 1 + Math.floor(Math.round((thursday.getTime() - jan1.getTime()) / 86_400_000) / 7);
}

/* Typed input in pickers: numeric dates in the locale's order, times as seconds since midnight. */

type DatePart = 'day' | 'month' | 'year';

/** Order of day, month and year in the locale's numeric date, e.g. de → day, month, year. */
export function dateOrder(locale?: string): DatePart[] {
  return new Intl.DateTimeFormat(resolveLocale(locale), { day: '2-digit', month: '2-digit', year: 'numeric' })
    .formatToParts(new Date(2026, 9, 5))
    .map((p) => p.type)
    .filter((t): t is DatePart => t === 'day' || t === 'month' || t === 'year');
}

/** Numeric date as typed in a field: „05.10.2026“ (de), „10/05/2026“ (en-US). */
export function formatInputDate(iso: string, locale?: string): string {
  const d = fromIsoDate(iso);
  return d ? new Intl.DateTimeFormat(resolveLocale(locale), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d) : '';
}

/** Placeholder like „TT.MM.JJJJ“ (de) or „MM/DD/YYYY“ (en-US). */
export function datePlaceholder(locale?: string): string {
  const loc = resolveLocale(locale) ?? 'de';
  const lang = loc.slice(0, 2);
  const letters: Record<DatePart, string> =
    lang === 'de' ? { day: 'TT', month: 'MM', year: 'JJJJ' } : lang === 'fr' ? { day: 'JJ', month: 'MM', year: 'AAAA' } : { day: 'DD', month: 'MM', year: 'YYYY' };
  return new Intl.DateTimeFormat(loc, { day: '2-digit', month: '2-digit', year: 'numeric' })
    .formatToParts(new Date(2026, 9, 5))
    .map((p) => (p.type === 'literal' ? p.value : letters[p.type as DatePart] ?? ''))
    .join('');
}

/**
 * Typed date → ISO, or null. Accepts ISO (`2026-10-05`) and numbers in the locale's order with any separators
 * („5.10.2026“, „05/10/26“, „5.10.“ = this year). Two-digit years are 20xx.
 */
export function parseInputDate(text: string, locale?: string, now = Date.now()): string | null {
  const s = text.trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return fromIsoDate(s) ? s : null;
  const nums = s.split(/\D+/).filter(Boolean).map(Number);
  const order = dateOrder(locale);
  const parts: Partial<Record<DatePart, number>> = {};
  if (nums.length === 3) order.forEach((p, i) => (parts[p] = nums[i]));
  else if (nums.length === 2) order.filter((p) => p !== 'year').forEach((p, i) => (parts[p] = nums[i]));
  else return null;
  let year = parts.year ?? new Date(now).getFullYear();
  if (year < 100) year += 2000;
  const { day, month } = parts;
  if (!day || !month || month > 12 || year > 9999) return null;
  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1) return null;
  return isoDate(date);
}

/** Whether the locale uses a 12-hour clock. */
export function uses12h(locale?: string): boolean {
  const cycle = new Intl.DateTimeFormat(resolveLocale(locale), { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h11' || cycle === 'h12';
}

/** Localised AM/PM labels. */
export function dayPeriods(locale?: string): [string, string] {
  const f = new Intl.DateTimeFormat(resolveLocale(locale), { hour: 'numeric', hour12: true });
  const period = (h: number) => f.formatToParts(new Date(2026, 0, 1, h)).find((p) => p.type === 'dayPeriod')?.value ?? (h < 12 ? 'AM' : 'PM');
  return [period(9), period(15)];
}

/** Seconds since midnight → `HH:mm` or `HH:mm:ss`. */
export function isoTime(secs: number, seconds = false): string {
  const p = (n: number) => String(n).padStart(2, '0');
  const t = `${p(Math.floor(secs / 3600))}:${p(Math.floor(secs / 60) % 60)}`;
  return seconds ? `${t}:${p(secs % 60)}` : t;
}

/** Times from `min` to `max` (seconds since midnight) in `step` seconds, for a pick list. */
export function timeSteps(step: number, min = 0, max = 86_399): number[] {
  const out: number[] = [];
  const s = Math.max(60, step);
  for (let t = Math.ceil(min / s) * s; t <= max; t += s) out.push(t);
  return out;
}
