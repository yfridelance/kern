import { newSpecPage } from '@stencil/core/testing';
import { ICON_NAMES } from '../../utils/icon-names';
import { BRANDS, BRAND_NAMES } from '../../utils/brands';
import { KernIcon } from './kern-icon';

describe('kern-icon', () => {
  it('is decorative without a label', async () => {
    const page = await newSpecPage({ components: [KernIcon], html: `<kern-icon name="wifi"></kern-icon>` });
    expect(page.root!.getAttribute('aria-hidden')).toBe('true');
    expect(page.root!.hasAttribute('role')).toBe(false);
    expect(page.root!.shadowRoot!.querySelector('svg')).not.toBeNull();
  });

  it('is an image with a label', async () => {
    const page = await newSpecPage({ components: [KernIcon], html: `<kern-icon name="power" label="Eingeschaltet"></kern-icon>` });
    expect([page.root!.getAttribute('role'), page.root!.getAttribute('aria-label'), page.root!.hasAttribute('aria-hidden')]).toEqual(['img', 'Eingeschaltet', false]);
  });

  it('draws every glyph and survives unknown names', async () => {
    for (const name of ICON_NAMES) {
      const page = await newSpecPage({ components: [KernIcon], html: `<kern-icon name="${name}"></kern-icon>` });
      expect(page.root!.shadowRoot!.querySelector('svg')!.children.length).toBeGreaterThan(0);
    }
    const unknown = await newSpecPage({ components: [KernIcon], html: `<kern-icon name="nope"></kern-icon>` });
    expect(unknown.root!.shadowRoot!.querySelector('svg')!.children.length).toBe(0);
  });

  it('draws brand icons filled in currentColor, or in the brand colour', async () => {
    const page = await newSpecPage({ components: [KernIcon], html: `<kern-icon name="brand-github"></kern-icon>` });
    const svg = page.root!.shadowRoot!.querySelector('svg')!;
    expect([svg.getAttribute('viewBox'), svg.getAttribute('fill'), svg.querySelector('path')!.getAttribute('d')!.length > 50]).toEqual(['0 0 24 24', 'currentColor', true]);
    page.root!.setAttribute('brand-color', '');
    await page.waitForChanges();
    expect(page.root!.shadowRoot!.querySelector('svg')!.getAttribute('fill')).toBe(BRANDS['brand-github'].hex);
  });

  it('lists every brand in ICON_NAMES and BRAND_NAMES', () => {
    expect(BRAND_NAMES.length).toBeGreaterThan(30);
    expect(BRAND_NAMES.every((n) => n.startsWith('brand-') && ICON_NAMES.includes(n))).toBe(true);
  });
});
