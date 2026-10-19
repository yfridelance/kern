import { newSpecPage } from '@stencil/core/testing';
import { ICON_NAMES } from '../../utils/icons';
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
});
