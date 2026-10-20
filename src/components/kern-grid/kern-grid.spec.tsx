import { newSpecPage } from '@stencil/core/testing';
import { KernGridItem } from '../kern-grid-item/kern-grid-item';
import { KernGrid } from './kern-grid';

const grid = async (attrs: string, children = '<div>A</div><div>B</div>') => {
  const page = await newSpecPage({ components: [KernGrid, KernGridItem], html: `<kern-grid ${attrs}>${children}</kern-grid>` });
  return { page, inner: page.root!.shadowRoot!.querySelector<HTMLElement>('.grid')! };
};

describe('kern-grid', () => {
  it('fits columns of at least min without columns', async () => {
    const { inner } = await grid(`min="180px"`);
    expect(inner.className).toBe('grid auto');
    expect(inner.style.getPropertyValue('--_min')).toBe('180px');
    expect(inner.style.getPropertyValue('--_cols')).toBe('initial');
  });

  it('stretches few items with fit', async () => {
    const { inner } = await grid(`fit`);
    expect(inner.classList.contains('fit')).toBe(true);
  });

  it('passes the column counts per breakpoint, unset ones as initial', async () => {
    const { inner } = await grid(`columns="1" columns-md="3"`);
    expect(inner.className).toBe('grid cols');
    expect(['--_c', '--_c-sm', '--_c-md', '--_c-lg'].map((v) => inner.style.getPropertyValue(v))).toEqual(['1', 'initial', '3', 'initial']);
  });

  it('reflects gap and align for the stylesheet', async () => {
    const { page } = await grid(`gap="lg" align="start"`);
    expect([page.root!.getAttribute('gap'), page.root!.getAttribute('align')]).toEqual(['lg', 'start']);
  });
});

describe('kern-grid-item', () => {
  it('passes its spans per breakpoint', async () => {
    const { page } = await grid(`columns="12"`, `<kern-grid-item span="12" span-md="8">A</kern-grid-item><kern-grid-item>B</kern-grid-item>`);
    const [a, b] = Array.from(page.root!.querySelectorAll<HTMLElement>('kern-grid-item'));
    expect(['--_s', '--_s-sm', '--_s-md', '--_s-lg'].map((v) => a.style.getPropertyValue(v))).toEqual(['12', 'initial', '8', 'initial']);
    expect(b.style.getPropertyValue('--_s')).toBe('1');
  });
});
