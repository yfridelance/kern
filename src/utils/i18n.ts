import { forceUpdate } from '@stencil/core';
import { de } from '../i18n/de';
import { en, type KernStrings, type KernTextKey } from '../i18n/en';

export type { KernStrings, KernTextKey };

const builtins: Record<string, KernStrings> = { en, de };
const overrides = new Map<string, Partial<KernStrings>>();
let explicit: string | undefined;

/** Components using Kern texts; re-rendered when the language changes. Weak, so removed ones can go. */
const hosts = new Set<{ ref: WeakRef<object>; method?: string }>();
const listeners = new Set<() => void>();
let observer: MutationObserver | undefined;
let last: string | undefined;

/** Language of the Kern texts: `setKernLocale()`, else `<html lang>`, else English. */
export function getKernLocale(): string {
  return explicit || (typeof document !== 'undefined' && document.documentElement?.lang) || 'en';
}

/**
 * Language of all Kern texts. Without a call (or with `undefined`) Kern follows `<html lang>`, also when it
 * changes later. Languages without built-in texts (only `en` and `de` ship) fall back to English unless
 * `setKernStrings()` supplies them.
 */
export function setKernLocale(locale?: string): void {
  explicit = locale || undefined;
  changed();
}

/** Adds or replaces texts for a language (`fr`, or `de-CH` for one region only). Applied at once. */
export function setKernStrings(locale: string, strings: Partial<KernStrings>): void {
  const key = locale.toLowerCase();
  overrides.set(key, { ...overrides.get(key), ...strings });
  changed(true);
}

/** Kern text for the current language: override of the full locale, of the base language, built-in, English. */
export function kernText(key: KernTextKey): string {
  const full = getKernLocale().toLowerCase();
  const base = full.split('-')[0];
  return overrides.get(full)?.[key] ?? overrides.get(base)?.[key] ?? builtins[base]?.[key] ?? en[key];
}

/** Calls `cb` whenever the language or the texts change; returns the unsubscribe function. */
export function onKernLocale(cb: () => void): () => void {
  listeners.add(cb);
  observe();
  return () => listeners.delete(cb);
}

/**
 * Text getter for a component: the property when set, else the Kern text `<tag>.<prop>`. Registers the component
 * for a re-render when the language changes, and calls its `method` then (e.g. to update the form validity).
 * Use as a field: `private t = kernTexts(this, 'kern-pagination');`.
 */
export function kernTexts(host: object, tag: string, method?: string): (prop: string) => string {
  hosts.add({ ref: new WeakRef(host), method });
  observe();
  return (prop) => ((host as Record<string, unknown>)[prop] as string | undefined) ?? kernText(`${tag}.${prop}` as KernTextKey);
}

function observe() {
  if (observer || typeof MutationObserver === 'undefined' || typeof document === 'undefined') return; // server-side / test DOM
  last = getKernLocale();
  observer = new MutationObserver(() => changed());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
}

function changed(force = false) {
  const now = getKernLocale();
  if (!force && now === last) return;
  last = now;
  for (const entry of hosts) {
    const host = entry.ref.deref() as Record<string, unknown> | undefined;
    if (!host) {
      hosts.delete(entry);
      continue;
    }
    forceUpdate(host);
    if (entry.method) (host[entry.method] as (() => void) | undefined)?.call(host);
  }
  listeners.forEach((cb) => cb());
}
