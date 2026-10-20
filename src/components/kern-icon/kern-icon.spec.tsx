import { newSpecPage } from '@stencil/core/testing';
import { ICON_NAMES } from '../../utils/icon-names';
import { BRANDS } from '../../utils/brands';
import { BRAND_NAMES } from '../../utils/brand-names';
import { FLAG_NAMES } from '../../utils/flag-names';
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

  it('draws an unknown brand name as an empty icon', async () => {
    const page = await newSpecPage({ components: [KernIcon], html: `<kern-icon name="brand-nope"></kern-icon>` });
    expect(page.root!.shadowRoot!.querySelector('svg')!.children.length).toBe(0);
  });

  it('loads the brand data when the name changes to a brand', async () => {
    const page = await newSpecPage({ components: [KernIcon], html: `<kern-icon name="lock"></kern-icon>` });
    page.root!.setAttribute('name', 'brand-zigbee');
    await new Promise((r) => setTimeout(r, 0));
    await page.waitForChanges();
    expect(page.root!.shadowRoot!.querySelector('svg path')!.getAttribute('d')).toBe(BRANDS['brand-zigbee'].path);
  });

  it('draws flags in colour, 4:3, from their own module', async () => {
    const page = await newSpecPage({ components: [KernIcon], html: `<kern-icon name="flag-ch" label="Schweiz"></kern-icon>` });
    const svg = page.root!.shadowRoot!.querySelector('.flag svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 640 480');
    expect(svg.querySelector('path[fill="red"]')).not.toBeNull();
    expect(page.root!.getAttribute('aria-label')).toBe('Schweiz');
  });

  it('lists every flag in ICON_NAMES and FLAG_NAMES, and draws an unknown one empty', async () => {
    expect(FLAG_NAMES.every((n) => /^flag-[a-z]{2}$/.test(n) && ICON_NAMES.includes(n))).toBe(true);
    const page = await newSpecPage({ components: [KernIcon], html: `<kern-icon name="flag-xx"></kern-icon>` });
    expect(page.root!.shadowRoot!.querySelector('svg')!.children.length).toBe(0);
  });
});
