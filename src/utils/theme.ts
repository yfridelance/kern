export type KernTheme = 'dark' | 'light';

export const THEMES: KernTheme[] = ['dark', 'light'];
export const THEME_STORAGE_KEY = 'kern-theme';

function isTheme(value: unknown): value is KernTheme {
  return value === 'dark' || value === 'light';
}

function readStored(): KernTheme | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(v) ? v : null;
  } catch {
    return null; // storage blocked
  }
}

/** Current theme from `<html data-theme>`; dark when unset. */
export function getTheme(): KernTheme {
  const t = document.documentElement.getAttribute('data-theme');
  return isTheme(t) ? t : 'dark';
}

/** Sets `data-theme` on `<html>`, remembers it (unless `persist: false`) and emits `kernThemeChange` on document. */
export function setTheme(theme: KernTheme, opts: { persist?: boolean } = {}): void {
  if (!isTheme(theme)) return;
  document.documentElement.setAttribute('data-theme', theme);
  if (opts.persist !== false) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* storage blocked */
    }
  }
  document.dispatchEvent(new CustomEvent('kernThemeChange', { detail: { theme } }));
}

/** Applies the stored theme, else the default (`'dark'`, `'light'` or `'system'`). */
export function initTheme(opts: { default?: KernTheme | 'system' } = {}): void {
  let fallback = opts.default ?? 'dark';
  if (fallback === 'system') {
    fallback = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  setTheme(readStored() ?? fallback, { persist: false });
}
