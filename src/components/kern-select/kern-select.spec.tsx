import { newSpecPage } from '@stencil/core/testing';
import { KernSelect } from './kern-select';

describe('kern-select', () => {
  it('mirrors child options and selects the marked one', async () => {
    const page = await newSpecPage({
      components: [KernSelect],
      html: `<kern-select label="Standort"><option value="1">Haus</option><option value="2" selected>Ferienwohnung</option></kern-select>`,
    });
    const opts = page.root!.shadowRoot!.querySelectorAll('select option');
    expect(Array.from(opts).map((o) => o.textContent)).toEqual(['Haus', 'Ferienwohnung']);
    expect(page.root!.value).toBe('2');
    expect(page.root!.shadowRoot!.querySelector('label')!.textContent).toBe('Standort');
  });

  it('prefers the options property', async () => {
    const page = await newSpecPage({ components: [KernSelect], html: `<kern-select></kern-select>` });
    page.root!.options = [{ value: 'a', label: 'A' }];
    await page.waitForChanges();
    expect(page.root!.shadowRoot!.querySelectorAll('select option').length).toBe(1);
  });
});
