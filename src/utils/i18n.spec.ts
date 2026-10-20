import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { de } from '../i18n/de';
import { en } from '../i18n/en';
import { getKernLocale, kernText, kernTexts, onKernLocale, setKernLocale, setKernStrings } from './i18n';

describe('Kern texts', () => {
  afterEach(() => {
    setKernLocale();
    document.documentElement.removeAttribute('lang');
  });

  it('falls back to English without a language and for languages without texts', () => {
    expect(getKernLocale()).toBe('en');
    expect(kernText('kern-pagination.labelNext')).toBe('Next page');
    setKernLocale('fr');
    expect(kernText('kern-pagination.labelNext')).toBe('Next page');
  });

  it('follows <html lang> unless a language is set', () => {
    document.documentElement.lang = 'de-CH';
    expect(getKernLocale()).toBe('de-CH');
    expect(kernText('kern-pagination.labelNext')).toBe('Nächste Seite');
    setKernLocale('en');
    expect(kernText('kern-pagination.labelNext')).toBe('Next page');
    setKernLocale();
    expect(kernText('kern-pagination.labelNext')).toBe('Nächste Seite');
  });

  it('takes overrides of the region, then the language, then the built-in text', () => {
    setKernStrings('xx', { 'kern-pagination.labelNext': 'Next (xx)', 'kern-pagination.labelLast': 'Last (xx)' });
    setKernStrings('xx-YY', { 'kern-pagination.labelNext': 'Next (xx-YY)' });
    setKernLocale('xx-YY');
    expect(kernText('kern-pagination.labelNext')).toBe('Next (xx-YY)');
    expect(kernText('kern-pagination.labelLast')).toBe('Last (xx)');
    expect(kernText('kern-pagination.labelFirst')).toBe('First page');
  });

  it('notifies on changes until unsubscribed', () => {
    const calls: string[] = [];
    const off = onKernLocale(() => calls.push(getKernLocale()));
    setKernLocale('de');
    setKernStrings('de', { 'kern-list.empty': 'Leer' });
    off();
    setKernLocale('en');
    expect(calls).toEqual(['de', 'de']);
  });

  it('prefers the property over the Kern text', () => {
    const host = { labelNext: undefined as string | undefined };
    const t = kernTexts(host, 'kern-pagination');
    expect(t('labelNext')).toBe('Next page');
    host.labelNext = 'Weiter';
    expect(t('labelNext')).toBe('Weiter');
  });

  it('ships every text in German', () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
  });
});

describe('component texts', () => {
  const dir = join(__dirname, '..', 'components');
  for (const name of readdirSync(dir)) {
    let source: string;
    try {
      source = readFileSync(join(dir, name, `${name}.tsx`), 'utf8');
    } catch {
      continue;
    }
    it(`${name} takes its texts from Kern`, () => {
      // No built-in default text in a property: it would not follow the language.
      expect(source.match(/@Prop\(\) (label\w*|closeLabel|navLabel|empty) = '/g) ?? []).toEqual([]);
      // Every text the component asks for exists.
      const tag = source.match(/kernTexts\(this, '([\w-]+)'/)?.[1];
      const props = [...source.matchAll(/this\.t\('(\w+)'\)/g)].map((m) => `${tag}.${m[1]}`);
      expect(props.filter((k) => !(k in en))).toEqual([]);
    });
  }
});
