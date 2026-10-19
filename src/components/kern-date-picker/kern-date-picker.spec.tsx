import { newSpecPage } from '@stencil/core/testing';
import { KernCalendar } from '../kern-calendar/kern-calendar';
import { KernDatePicker } from './kern-date-picker';

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernDatePicker, KernCalendar], html: `<kern-date-picker locale="de-CH" label="Stichtag" ${attrs}></kern-date-picker>` });
  const root = page.root!.shadowRoot!;
  const input = root.querySelector('input')!;
  const events: string[] = [];
  page.root!.addEventListener('kernChange', (e) => events.push((e as CustomEvent).detail.value));
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();
  };
  return { page, root, input, events, type, picker: page.root as unknown as KernDatePicker };
};

describe('kern-date-picker', () => {
  it('shows the value in the locale format with a localised placeholder', async () => {
    const { root, input } = await setup(`value="2026-10-05"`);
    expect(input.value).toBe('05.10.2026');
    expect(input.getAttribute('placeholder')).toBe('TT.MM.JJJJ');
    expect(root.querySelector('label')!.textContent).toBe('Stichtag');
    expect(root.querySelector('kern-calendar')).not.toBeNull();
  });

  it('applies typed dates and normalises the text', async () => {
    const { picker, input, events, type } = await setup(`value="2026-10-05"`);
    await type('7.11.26');
    expect(picker.value).toBe('2026-11-07');
    expect(input.value).toBe('07.11.2026');
    await type('');
    expect(picker.value).toBe('');
    expect(events).toEqual(['2026-11-07', '']);
  });

  it('marks invalid and out-of-range input', async () => {
    const { page, root, picker, type, events } = await setup(`value="2026-10-05" min="2026-10-01" max="2026-10-31"`);
    await type('32.10.2026');
    expect(picker.value).toBe('2026-10-05');
    expect(root.querySelector('.error')!.textContent).toBe('Kein gültiges Datum');
    expect(page.root!.hasAttribute('invalid')).toBe(true);
    await type('5.11.2026');
    expect(picker.value).toBe('2026-11-05');
    expect(root.querySelector('.error')!.textContent).toBe('Datum nicht erlaubt');
    await type('6.10.2026');
    expect(root.querySelector('.error')).toBeNull();
    expect(events).toEqual(['2026-11-05', '2026-10-06']);
  });

  it('takes a pick from the calendar', async () => {
    const { page, root, picker, input, events } = await setup(`value="2026-10-05"`);
    root.querySelector('kern-calendar')!.shadowRoot!.querySelector<HTMLButtonElement>('button[data-iso="2026-10-20"]')!.click();
    await page.waitForChanges();
    expect(picker.value).toBe('2026-10-20');
    expect(input.value).toBe('20.10.2026');
    expect(events).toEqual(['2026-10-20']);
  });

  it('clears with the clear button', async () => {
    const { page, root, picker, events } = await setup(`value="2026-10-05" clearable`);
    root.querySelector<HTMLButtonElement>('.clear')!.click();
    await page.waitForChanges();
    expect(picker.value).toBe('');
    expect(root.querySelector('.clear')).toBeNull();
    expect(events).toEqual(['']);
  });

  it('locks the button when readonly', async () => {
    const { root } = await setup(`value="2026-10-05" readonly clearable`);
    expect(root.querySelector('.open')!.hasAttribute('disabled')).toBe(true);
    expect(root.querySelector('.clear')).toBeNull();
  });
});
