import { newSpecPage } from '@stencil/core/testing';
import { setKernLocale } from '../../utils/i18n';
import { KernSelect, type KernOption } from '../kern-select/kern-select';
import { KernLanguageSelect } from './kern-language-select';

const setup = async (html: string) => {
  const page = await newSpecPage({ components: [KernLanguageSelect, KernSelect], html });
  const root = page.root!.shadowRoot!;
  const events: { value: string; href?: string }[] = [];
  page.root!.addEventListener('kernChange', (e) => events.push((e as CustomEvent).detail));
  return { page, root, events, host: page.root as HTMLElement & { value: string } };
};

describe('kern-language-select', () => {
  afterEach(() => setKernLocale());

  it('offers the languages by their own names in a dropdown', async () => {
    const { root } = await setup(`<kern-language-select value="de" languages="de,en,fr"></kern-language-select>`);
    const select = root.querySelector('kern-select') as HTMLElement & { options: KernOption[]; value: string };
    expect(select.options.map((o) => [o.value, o.label, o.lang])).toEqual([
      ['de', 'Deutsch', 'de'],
      ['en', 'English', 'en'],
      ['fr', 'Français', 'fr'],
    ]);
    expect(select.value).toBe('de');
    expect(select.getAttribute('aria-label-text')).toBe('Language');
  });

  it('shows codes with the full name for screen readers, and flags by region or language', async () => {
    const { root } = await setup(`<kern-language-select value="de" languages="de,de-CH,en,xx" display="code" flags></kern-language-select>`);
    const options = (root.querySelector('kern-select') as HTMLElement & { options: KernOption[] }).options;
    expect(options.map((o) => [o.label, o.ariaLabel, o.icon])).toEqual([
      ['DE', 'Deutsch', 'flag-de'],
      ['DE-CH', 'Schweizer Hochdeutsch', 'flag-ch'],
      ['EN', 'English', 'flag-gb'],
      ['XX', 'xx', undefined],
    ]);
  });

  it('takes names and flags from child options', async () => {
    const { root } = await setup(`<kern-language-select value="gsw" flags><option value="gsw" data-flag="ch">Schwiizerdütsch</option><option value="en-US">English (US)</option></kern-language-select>`);
    const options = (root.querySelector('kern-select') as HTMLElement & { options: KernOption[] }).options;
    expect(options.map((o) => [o.value, o.label, o.icon])).toEqual([
      ['gsw', 'Schwiizerdütsch', 'flag-ch'],
      ['en-US', 'English (US)', 'flag-us'],
    ]);
  });

  it('reports a choice from the dropdown once', async () => {
    const { page, root, events, host } = await setup(`<kern-language-select value="de" languages="de,en"></kern-language-select>`);
    root.querySelector('kern-select')!.dispatchEvent(new CustomEvent('kernChange', { detail: { value: 'en' }, bubbles: true, composed: true }));
    await page.waitForChanges();
    expect(events).toEqual([{ value: 'en', href: undefined }]);
    expect(host.value).toBe('en');
  });

  it('puts the languages side by side as buttons, the current one marked', async () => {
    const { page, root, events, host } = await setup(`<kern-language-select variant="inline" value="de" languages="de,en" display="code"></kern-language-select>`);
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Language');
    const active = root.querySelector('[aria-current="true"]')!;
    expect([active.tagName, active.getAttribute('lang'), active.querySelector('.sr')!.textContent]).toEqual(['SPAN', 'de', 'Deutsch']);
    root.querySelector<HTMLButtonElement>('button[lang="en"]')!.click();
    await page.waitForChanges();
    expect(events).toEqual([{ value: 'en', href: undefined }]);
    expect(host.value).toBe('en');
    expect(root.querySelector('[aria-current="true"]')!.getAttribute('lang')).toBe('en');
  });

  it('links to each language with href and lets the app take over', async () => {
    const { page, root, events } = await setup(`<kern-language-select variant="inline" value="de" languages="de,en" href="/{locale}/settings"></kern-language-select>`);
    const link = root.querySelector('a')!;
    expect([link.getAttribute('href'), link.getAttribute('hreflang'), link.textContent]).toEqual(['/en/settings', 'en', 'English']);
    page.root!.addEventListener('kernChange', (e) => e.preventDefault());
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    link.dispatchEvent(click);
    expect(events).toEqual([{ value: 'en', href: '/en/settings' }]);
    expect(click.defaultPrevented).toBe(true);
  });

  it('names itself in the Kern language', async () => {
    const { page, root } = await setup(`<kern-language-select variant="inline" value="de" languages="de,en"></kern-language-select>`);
    setKernLocale('de');
    await page.waitForChanges();
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Sprache');
  });
});
