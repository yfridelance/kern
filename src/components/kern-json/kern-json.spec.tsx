import { newSpecPage } from '@stencil/core/testing';
import { KernJson } from './kern-json';

describe('kern-json', () => {
  it('renders keys, typed leaves and open depth', async () => {
    const page = await newSpecPage({ components: [KernJson], html: '<kern-json></kern-json>' });
    page.root!.data = { cloud: { enable: false }, name: 'Boiler', n: 3, tags: [1, 2] };
    await page.waitForChanges();
    const sr = page.root!.shadowRoot!;
    expect(sr.querySelector('.string')!.textContent).toBe('"Boiler"');
    expect(sr.querySelector('.literal')!.textContent).toBe('false');
    expect(sr.querySelectorAll('details').length).toBe(2);
    expect(sr.querySelector('details')!.hasAttribute('open')).toBe(true);
    expect(sr.querySelectorAll('.meta')[1].textContent).toBe('[2]');
  });

  it('parses a JSON string', async () => {
    const page = await newSpecPage({ components: [KernJson], html: `<kern-json data='{"a":null}'></kern-json>` });
    expect(page.root!.shadowRoot!.querySelector('.literal')!.textContent).toBe('null');
  });
});
