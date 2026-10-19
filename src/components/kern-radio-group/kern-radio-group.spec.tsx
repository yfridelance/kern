import { newSpecPage } from '@stencil/core/testing';
import { KernRadio } from '../kern-radio/kern-radio';
import { KernRadioGroup } from './kern-radio-group';

const html = (attrs = '', checked = '') => `<kern-radio-group label="IP-Adresse" name="mode" ${attrs}>
  <kern-radio value="dhcp" label="DHCP" description="Adresse vom Router" ${checked === 'dhcp' ? 'checked' : ''}></kern-radio>
  <kern-radio value="static" label="Statisch" description="Feste Adresse"></kern-radio>
  <kern-radio value="off" label="Aus" disabled></kern-radio>
</kern-radio-group>`;

const setup = async (attrs = '', checked = '') => {
  const page = await newSpecPage({ components: [KernRadioGroup, KernRadio], html: html(attrs, checked) });
  const group = page.root as unknown as KernRadioGroup;
  const radios = Array.from(page.root!.querySelectorAll('kern-radio')) as (HTMLElement & { checked: boolean })[];
  const events: string[] = [];
  page.root!.addEventListener('kernChange', (e) => events.push((e as CustomEvent).detail.value));
  const key = async (target: HTMLElement, k: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    await page.waitForChanges();
  };
  return { page, group, radios, events, key };
};

describe('kern-radio-group', () => {
  it('renders a labelled radio group with one tab stop', async () => {
    const { page, radios } = await setup();
    const g = page.root!.shadowRoot!.querySelector('[role="radiogroup"]')!;
    expect(g.getAttribute('aria-labelledby')).toBe(page.root!.shadowRoot!.querySelector('.label')!.id);
    expect(radios.map((r) => r.getAttribute('role'))).toEqual(['radio', 'radio', 'radio']);
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1]);
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'false', 'false']);
  });

  it('takes the checked child as value', async () => {
    const { group, radios } = await setup('', 'dhcp');
    expect(group.value).toBe('dhcp');
    expect(radios[0].checked).toBe(true);
  });

  it('selects on click, not on disabled options', async () => {
    const { page, group, radios, events } = await setup();
    radios[1].click();
    await page.waitForChanges();
    radios[2].click();
    await page.waitForChanges();
    expect(group.value).toBe('static');
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, 0, -1]);
    expect(events).toEqual(['static']);
  });

  it('moves with arrow keys, wraps and skips disabled options', async () => {
    const { group, radios, key, events } = await setup('value="dhcp"');
    await key(radios[0], 'ArrowDown');
    expect(group.value).toBe('static');
    await key(radios[1], 'ArrowDown');
    expect(group.value).toBe('dhcp');
    await key(radios[0], 'ArrowUp');
    await key(radios[1], ' ');
    expect(events).toEqual(['static', 'dhcp', 'static']);
  });

  it('ignores input when disabled', async () => {
    const { page, group, radios } = await setup('disabled');
    radios[1].click();
    await page.waitForChanges();
    expect(group.value).toBe('');
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, -1, -1]);
  });
});
