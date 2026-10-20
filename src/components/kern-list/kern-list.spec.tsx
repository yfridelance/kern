import { newSpecPage } from '@stencil/core/testing';
import { KernListItem } from '../kern-list-item/kern-list-item';
import { KernList } from './kern-list';

describe('kern-list', () => {
  it('shows items in a list and hides the empty text', async () => {
    const page = await newSpecPage({ components: [KernList, KernListItem], html: `<kern-list label="Geräte"><kern-list-item heading="A"></kern-list-item></kern-list>` });
    const root = page.root!.shadowRoot!;
    expect(root.querySelector('[role="list"]')!.getAttribute('aria-label')).toBe('Geräte');
    expect(root.querySelector('[role="list"]')!.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('.empty')).toBeNull();
  });

  it('shows the empty text without items', async () => {
    const page = await newSpecPage({ components: [KernList], html: `<kern-list empty="Keine Geräte gefunden"></kern-list>` });
    const root = page.root!.shadowRoot!;
    expect(root.querySelector('.empty')!.textContent).toBe('Keine Geräte gefunden');
    expect(root.querySelector('[role="list"]')!.hasAttribute('hidden')).toBe(true);
  });

  it('names the list by its visible heading', async () => {
    const page = await newSpecPage({ components: [KernList, KernListItem], html: `<kern-list heading="Devices" label="ignored"><kern-list-item heading="A"></kern-list-item></kern-list>` });
    const root = page.root!.shadowRoot!;
    const list = root.querySelector('[role="list"]')!;
    const heading = root.querySelector('.heading')!;
    expect(heading.textContent).toBe('Devices');
    expect(list.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(list.hasAttribute('aria-label')).toBe(false);
  });

  it('reflects the nav variant and has no heading by default', async () => {
    const page = await newSpecPage({ components: [KernList], html: `<kern-list></kern-list>` });
    expect(page.root!.getAttribute('variant')).toBe('default');
    expect(page.root!.shadowRoot!.querySelector('.heading')).toBeNull();
    (page.root as HTMLElement & { variant: string }).variant = 'nav';
    await page.waitForChanges();
    expect(page.root!.getAttribute('variant')).toBe('nav');
  });
});
