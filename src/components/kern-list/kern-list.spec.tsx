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
});
