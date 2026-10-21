import { newSpecPage } from '@stencil/core/testing';
import { KernJson } from './kern-json';

describe('kern-json', () => {
  it('renders keys, typed leaves and open depth', async () => {
    const page = await newSpecPage({ components: [KernJson], html: '<kern-json></kern-json>' });
    page.root!.data = { cloud: { enable: false }, name: 'Boiler', n: 3, tags: [1, 2] };
    await page.waitForChanges();
    const sr = page.root!.shadowRoot!;
    expect(sr.querySelector('.string')!.textContent).toBe('"Boiler"');
    expect(sr.querySelector('.literal')!.textContent).toBe('false');
    expect(sr.querySelectorAll('details').length).toBe(2);
    expect(sr.querySelector('details')!.hasAttribute('open')).toBe(true);
    expect(sr.querySelectorAll('.meta')[1].textContent).toBe('[2]');
  });

  it('parses a JSON string', async () => {
    const page = await newSpecPage({ components: [KernJson], html: `<kern-json data='{"a":null}'></kern-json>` });
    expect(page.root!.shadowRoot!.querySelector('.literal')!.textContent).toBe('null');
  });

  const tree = async () => {
    const page = await newSpecPage({ components: [KernJson], html: '<kern-json open-depth="1"></kern-json>' });
    page.root!.data = { a: { b: { c: 1 } }, d: [{ e: 2 }] };
    await page.waitForChanges();
    const details = () => Array.from(page.root!.shadowRoot!.querySelectorAll('details'));
    const open = () => details().map((d) => d.hasAttribute('open'));
    // A click on a summary toggles the open attribute.
    const toggle = (i: number, on: boolean) => (on ? details()[i].setAttribute('open', '') : details()[i].removeAttribute('open'));
    return { page, details, open, toggle };
  };

  it('marks every node with its depth', async () => {
    const { details } = await tree();
    expect(details().map((d) => d.getAttribute('data-depth'))).toEqual(['0', '1', '0', '1']);
  });

  it('applies a changed openDepth to nodes toggled by hand', async () => {
    const { page, open, toggle } = await tree();
    expect(open()).toEqual([true, false, true, false]);
    toggle(0, false);
    toggle(1, true);
    page.root!.openDepth = 2;
    await page.waitForChanges();
    expect(open()).toEqual([true, true, true, true]);
    toggle(0, false);
    toggle(3, false);
    page.root!.openDepth = 1;
    await page.waitForChanges();
    expect(open()).toEqual([true, false, true, false]);
  });

  it('setOpenDepth with the same depth resets hand toggles', async () => {
    const { page, open, toggle } = await tree();
    toggle(0, false);
    toggle(3, true);
    await page.root!.setOpenDepth(1);
    await page.waitForChanges();
    expect(open()).toEqual([true, false, true, false]);
  });

  it('expandAll and collapseAll reset hand toggles, also when repeated', async () => {
    const { page, open, toggle } = await tree();
    await page.root!.expandAll();
    await page.waitForChanges();
    expect(open()).toEqual([true, true, true, true]);
    toggle(1, false);
    toggle(2, false);
    await page.root!.expandAll();
    await page.waitForChanges();
    expect(open()).toEqual([true, true, true, true]);
    await page.root!.collapseAll();
    await page.waitForChanges();
    expect(open()).toEqual([false, false, false, false]);
    toggle(0, true);
    await page.root!.collapseAll();
    await page.waitForChanges();
    expect(open()).toEqual([false, false, false, false]);
    expect(page.root!.openDepth).toBe(0);
  });
});
