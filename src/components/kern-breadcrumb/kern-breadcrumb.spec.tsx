import { newSpecPage } from '@stencil/core/testing';
import { KernBreadcrumb } from './kern-breadcrumb';

const links = (n: number) =>
  Array.from({ length: n }, (_, i) => (i === n - 1 ? `<span>Ebene ${i + 1}</span>` : `<a href="/l${i + 1}">Ebene ${i + 1}</a>`)).join('');

describe('kern-breadcrumb', () => {
  it('puts each child in its own list item with separators and marks the last as current', async () => {
    const page = await newSpecPage({ components: [KernBreadcrumb], html: `<kern-breadcrumb>${links(3)}</kern-breadcrumb>` });
    const root = page.root!.shadowRoot!;
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Path');
    expect(Array.from(page.root!.children).map((c) => c.getAttribute('slot'))).toEqual(['item-0', 'item-1', 'item-2']);
    expect(Array.from(page.root!.children).map((c) => c.getAttribute('aria-current'))).toEqual([null, null, 'page']);
    expect(root.querySelectorAll('li').length).toBe(3);
    expect(root.querySelectorAll('.sep').length).toBe(2);
    expect(root.querySelector('li.current slot')!.getAttribute('name')).toBe('item-2');
  });

  it('folds the middle into a menu with max-items', async () => {
    const page = await newSpecPage({ components: [KernBreadcrumb], html: `<kern-breadcrumb max-items="4">${links(6)}</kern-breadcrumb>` });
    const root = page.root!.shadowRoot!;
    const visible = Array.from(root.querySelectorAll('li:not([hidden]) slot')).map((s) => s.getAttribute('name'));
    expect(visible).toEqual(['item-0', 'item-4', 'item-5']);
    const entries = Array.from(root.querySelectorAll('kern-menu-item'));
    expect(entries.map((e) => [e.getAttribute('value'), e.textContent])).toEqual([
      ['1', 'Ebene 2'],
      ['2', 'Ebene 3'],
      ['3', 'Ebene 4'],
    ]);
  });

  it('clicks the original link for a menu choice', async () => {
    const page = await newSpecPage({ components: [KernBreadcrumb], html: `<kern-breadcrumb max-items="3">${links(5)}</kern-breadcrumb>` });
    const target = page.root!.children[2] as HTMLElement;
    let clicked = 0;
    target.addEventListener('click', (e) => {
      e.preventDefault();
      clicked++;
    });
    page.root!.shadowRoot!.querySelector('kern-menu')!.dispatchEvent(new CustomEvent('kernSelect', { detail: { value: '2' } }));
    expect(clicked).toBe(1);
  });
});
