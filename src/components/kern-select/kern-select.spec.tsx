import { newSpecPage } from '@stencil/core/testing';
import { KernSelect } from './kern-select';

describe('kern-select', () => {
  it('mirrors child options into its own listbox and selects the marked one', async () => {
    const page = await newSpecPage({
      components: [KernSelect],
      html: `<kern-select label="Standort"><option value="1">Haus</option><option value="2" selected>Ferienwohnung</option></kern-select>`,
    });
    const sr = page.root!.shadowRoot!;
    const opts = sr.querySelectorAll('[role="option"]');
    expect(Array.from(opts).map((o) => o.textContent)).toEqual(['Haus', 'Ferienwohnung']);
    expect(opts[1].getAttribute('aria-selected')).toBe('true');
    expect(page.root!.value).toBe('2');
    expect(sr.querySelector('[role="combobox"] .current')!.textContent).toBe('Ferienwohnung');
    expect(sr.querySelector('label')!.textContent).toBe('Standort');
    expect(sr.querySelector('select')).toBeNull();
  });

  it('picks an option on click and emits kernChange', async () => {
    const page = await newSpecPage({ components: [KernSelect], html: `<kern-select><option value="a">A</option><option value="b">B</option></kern-select>` });
    const seen: string[] = [];
    page.root!.addEventListener('kernChange', (e) => seen.push((e as CustomEvent).detail.value));
    (page.root!.shadowRoot!.querySelectorAll('[role="option"]')[1] as HTMLElement).click();
    await page.waitForChanges();
    expect(page.root!.value).toBe('b');
    expect(seen).toEqual(['b']);
  });

  it('skips disabled options and shows the placeholder without a value', async () => {
    const page = await newSpecPage({
      components: [KernSelect],
      html: `<kern-select placeholder="Bitte wählen"><option value="a" disabled>A</option><option value="b">B</option></kern-select>`,
    });
    const sr = page.root!.shadowRoot!;
    expect(sr.querySelector('[role="combobox"] .current')!.textContent).toBe('Bitte wählen');
    (sr.querySelectorAll('[role="option"]')[0] as HTMLElement).click();
    await page.waitForChanges();
    expect(page.root!.value).toBe('');
  });

  it('shows footer actions only when slotted', async () => {
    const without = await newSpecPage({ components: [KernSelect], html: `<kern-select><option value="a">A</option></kern-select>` });
    expect(without.root!.shadowRoot!.querySelector('.footer')!.hasAttribute('hidden')).toBe(true);
    const withFooter = await newSpecPage({
      components: [KernSelect],
      html: `<kern-select><option value="a">A</option><button slot="footer">Standorte bearbeiten</button></kern-select>`,
    });
    expect(withFooter.root!.shadowRoot!.querySelector('.footer')!.hasAttribute('hidden')).toBe(false);
  });

  it('prefers the options property', async () => {
    const page = await newSpecPage({ components: [KernSelect], html: `<kern-select></kern-select>` });
    page.root!.options = [{ value: 'a', label: 'A' }];
    await page.waitForChanges();
    expect(page.root!.shadowRoot!.querySelectorAll('[role="option"]').length).toBe(1);
  });

  it('filters options with searchable and picks the active match on Enter', async () => {
    const page = await newSpecPage({
      components: [KernSelect],
      html: `<kern-select searchable placeholder="Gerät"><option value="1">Bad Lüftung</option><option value="2">Küche Licht</option><option value="3">Bad Spiegel</option></kern-select>`,
    });
    const sr = page.root!.shadowRoot!;
    const search = sr.querySelector<HTMLInputElement>('.search input')!;
    expect(search.getAttribute('aria-label')).toBe('Search …');
    search.value = 'bad';
    search.dispatchEvent(new Event('input'));
    await page.waitForChanges();
    expect(Array.from(sr.querySelectorAll('[role="option"]')).map((o) => o.textContent)).toEqual(['Bad Lüftung', 'Bad Spiegel']);
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await page.waitForChanges();
    expect(page.root!.value).toBe('3');
    search.value = 'xyz';
    search.dispatchEvent(new Event('input'));
    await page.waitForChanges();
    expect(sr.querySelector('.no-results')!.textContent).toBe('No results');
  });

  it('toggles several values with multiple and shows them as chips', async () => {
    const page = await newSpecPage({
      components: [KernSelect],
      html: `<kern-select multiple name="tags" placeholder="Tags"><option value="a" selected>Aussen</option><option value="b">Bad</option><option value="c" selected>Cloud</option></kern-select>`,
    });
    const sr = page.root!.shadowRoot!;
    const seen: unknown[] = [];
    page.root!.addEventListener('kernChange', (e) => seen.push((e as CustomEvent).detail.value));
    expect(page.root!.value).toEqual(['a', 'c']);
    expect(Array.from(sr.querySelectorAll('.chip-label')).map((c) => c.textContent)).toEqual(['Aussen', 'Cloud']);
    expect(sr.querySelector('[role="combobox"]')!.tagName).toBe('DIV');
    (sr.querySelectorAll('[role="option"]')[1] as HTMLElement).click();
    await page.waitForChanges();
    expect(page.root!.value).toEqual(['a', 'c', 'b']);
    (sr.querySelectorAll('.chip-remove')[0] as HTMLElement).click();
    await page.waitForChanges();
    expect(page.root!.value).toEqual(['c', 'b']);
    sr.querySelector('[role="combobox"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    await page.waitForChanges();
    expect(seen).toEqual([['a', 'c', 'b'], ['c', 'b'], ['c']]);
    expect(sr.querySelectorAll('[role="option"][aria-selected="true"]').length).toBe(1);
  });

  it('sizes the trigger by hidden copies of all options and the placeholder', async () => {
    const page = await newSpecPage({
      components: [KernSelect],
      html: `<kern-select placeholder="Bitte wählen" value="a"><option value="a">Haus</option><option value="b">Ferienwohnung</option></kern-select>`,
    });
    const sizers = Array.from(page.root!.shadowRoot!.querySelectorAll('.trigger .value .sizer'));
    expect(sizers.map((s) => s.textContent)).toEqual(['Haus', 'Ferienwohnung', 'Bitte wählen']);
    expect(sizers.every((s) => s.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(page.root!.shadowRoot!.querySelector('.trigger .current')!.textContent).toBe('Haus');
  });

  it('has no sizers with multiple', async () => {
    const page = await newSpecPage({ components: [KernSelect], html: `<kern-select multiple placeholder="Tags"><option value="a">A</option></kern-select>` });
    expect(page.root!.shadowRoot!.querySelector('.sizer')).toBeNull();
  });

  it('accepts a comma-separated value attribute with multiple', async () => {
    const page = await newSpecPage({ components: [KernSelect], html: `<kern-select multiple value="a, b"><option value="a">A</option><option value="b">B</option></kern-select>` });
    expect(page.root!.value).toEqual(['a', 'b']);
  });
});

describe('kern-select options with icons', () => {
  it('shows the icon and keeps a short label with its full name', async () => {
    const page = await newSpecPage({
      components: [KernSelect],
      html: `<kern-select value="de" aria-label-text="Language"><option value="de" data-icon="flag-de" aria-label="Deutsch" lang="de">DE</option><option value="en" data-icon="flag-gb" aria-label="English" lang="en">EN</option></kern-select>`,
    });
    const root = page.root!.shadowRoot!;
    expect(root.querySelector('.trigger .current kern-icon')!.getAttribute('name')).toBe('flag-de');
    expect(root.querySelector('.trigger .value .sr')!.textContent).toBe('Deutsch');
    const option = root.querySelectorAll('[role="option"]')[1];
    expect([option.getAttribute('aria-label'), option.getAttribute('lang'), option.querySelector('kern-icon')!.getAttribute('name')]).toEqual(['English', 'en', 'flag-gb']);
  });
});
