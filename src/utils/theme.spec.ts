import { getTheme, initTheme, setTheme, THEME_STORAGE_KEY } from './theme';

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('defaults to dark', () => {
    expect(getTheme()).toBe('dark');
    initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('remembers an explicit choice and restores it', () => {
    setTheme('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    document.documentElement.removeAttribute('data-theme');
    initTheme();
    expect(getTheme()).toBe('light');
  });

  it('emits kernThemeChange', () => {
    const seen: string[] = [];
    document.addEventListener('kernThemeChange', (e) => seen.push((e as CustomEvent).detail.theme));
    setTheme('light', { persist: false });
    expect(seen).toEqual(['light']);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });
});
