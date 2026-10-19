import { newSpecPage } from '@stencil/core/testing';
import { KernAccordionItem } from '../kern-accordion-item/kern-accordion-item';
import { KernAccordion } from './kern-accordion';

const html = (attrs = '') => `<kern-accordion ${attrs}>
  <kern-accordion-item heading="WLAN" open>SSID …</kern-accordion-item>
  <kern-accordion-item heading="MQTT">Server …</kern-accordion-item>
  <kern-accordion-item heading="Cloud" disabled>…</kern-accordion-item>
</kern-accordion>`;

const setup = async (attrs = '') => {
  const page = await newSpecPage({ components: [KernAccordion, KernAccordionItem], html: html(attrs) });
  const items = Array.from(page.root!.querySelectorAll('kern-accordion-item')) as (HTMLElement & { open: boolean })[];
  const details = (i: number) => items[i].shadowRoot!.querySelector('details')!;
  const toggle = async (i: number, open: boolean) => {
    if (open) details(i).setAttribute('open', '');
    else details(i).removeAttribute('open');
    details(i).dispatchEvent(new Event('toggle'));
    await page.waitForChanges();
  };
  return { page, items, details, toggle };
};

describe('kern-accordion', () => {
  it('renders items on details/summary with the heading', async () => {
    const { items, details } = await setup();
    expect(items[0].shadowRoot!.querySelector('summary .heading')!.textContent).toBe('WLAN');
    expect([details(0).hasAttribute('open'), details(1).hasAttribute('open')]).toEqual([true, false]);
    expect(items[2].shadowRoot!.querySelector('summary')!.getAttribute('aria-disabled')).toBe('true');
  });

  it('closes the others when one opens', async () => {
    const { items, toggle } = await setup();
    const events: boolean[] = [];
    items[1].addEventListener('kernToggle', (e) => events.push((e as CustomEvent).detail.open));
    await toggle(1, true);
    expect(items.map((i) => i.open)).toEqual([false, true, false]);
    expect(events).toEqual([true]);
  });

  it('keeps several open with multiple', async () => {
    const { items, toggle } = await setup('multiple');
    await toggle(1, true);
    expect(items.map((i) => i.open)).toEqual([true, true, false]);
  });

  it('opens from the property', async () => {
    const { page, items, details } = await setup('multiple');
    items[1].open = true;
    await page.waitForChanges();
    expect(details(1).hasAttribute('open')).toBe(true);
  });
});
