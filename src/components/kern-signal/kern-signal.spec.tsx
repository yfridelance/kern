import { newSpecPage } from '@stencil/core/testing';
import { KernSignal } from './kern-signal';

describe('kern-signal', () => {
  it('lights bars by RSSI and labels them', async () => {
    const page = await newSpecPage({ components: [KernSignal], html: '<kern-signal rssi="-63"></kern-signal>' });
    const el = page.root!;
    expect(el.getAttribute('data-level')).toBe('3');
    expect(el.getAttribute('aria-label')).toBe('Wi-Fi signal 3/4, -63 dBm');
    expect(el.shadowRoot!.querySelectorAll('i.on').length).toBe(3);
    expect(el.shadowRoot!.textContent).toContain('-63 dBm');
  });

  it('hides the number on request', async () => {
    const page = await newSpecPage({ components: [KernSignal], html: '<kern-signal rssi="-90" hide-value></kern-signal>' });
    expect(page.root!.getAttribute('data-level')).toBe('0');
    expect(page.root!.shadowRoot!.textContent).not.toContain('dBm');
  });
});
