import { newSpecPage } from '@stencil/core/testing';
import { KernStat } from './kern-stat';

describe('kern-stat', () => {
  it('colours the delta by trend, inverted when more is bad', async () => {
    const page = await newSpecPage({ components: [KernStat], html: `<kern-stat label="Offline" value="2" delta="1" trend="up" invert></kern-stat>` });
    const delta = page.root!.shadowRoot!.querySelector('.delta')!;
    expect(delta.classList.contains('bad')).toBe(true);
    expect(delta.textContent).toContain('▲');
  });
});
