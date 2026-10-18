import { newSpecPage } from '@stencil/core/testing';
import { KernMeter } from './kern-meter';

describe('kern-meter', () => {
  it('colours by threshold and exposes meter semantics', async () => {
    const page = await newSpecPage({ components: [KernMeter], html: '<kern-meter label="Flash" value="81"></kern-meter>' });
    const el = page.root!;
    expect(el.getAttribute('data-level')).toBe('warn');
    expect(el.getAttribute('role')).toBe('meter');
    expect(el.getAttribute('aria-valuetext')).toBe('81 %');
  });

  it('shows raw values for other units', async () => {
    const page = await newSpecPage({ components: [KernMeter], html: '<kern-meter label="Temp" value="68" max="70" unit="°C"></kern-meter>' });
    expect(page.root!.getAttribute('data-level')).toBe('danger');
    expect(page.root!.shadowRoot!.querySelector('.value')!.textContent).toBe('68 °C');
  });

  it('stays neutral when asked', async () => {
    const page = await newSpecPage({ components: [KernMeter], html: '<kern-meter value="99" neutral></kern-meter>' });
    expect(page.root!.getAttribute('data-level')).toBe('neutral');
  });
});
