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
    expect(sr.querySelector('[role="combobox"] .value')!.textContent).toBe('Ferienwohnung');
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
    expect(sr.querySelector('[role="combobox"] .value')!.textContent).toBe('Bitte wählen');
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
});
