import { newSpecPage } from '@stencil/core/testing';
import { KernCalendar } from '../kern-calendar/kern-calendar';
import { KernDateRangePicker } from './kern-date-range-picker';
import { addDays, todayIso } from '../../utils/datetime';

const setup = async (attrs: string, children = '') => {
  const page = await newSpecPage({
    components: [KernDateRangePicker, KernCalendar],
    html: `<kern-date-range-picker locale="de-CH" label="Zeitraum" ${attrs}>${children}</kern-date-range-picker>`,
  });
  const root = page.root!.shadowRoot!;
  const [from, to] = Array.from(root.querySelectorAll('input'));
  const events: unknown[] = [];
  page.root!.addEventListener('kernChange', (e) => events.push((e as CustomEvent).detail));
  const type = async (input: HTMLInputElement, text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();
  };
  const error = () => root.querySelector('.error')?.textContent;
  return { page, root, from, to, events, type, error, picker: page.root as unknown as KernDateRangePicker };
};

describe('kern-date-range-picker', () => {
  it('shows both dates and the interval value', async () => {
    const { from, to, picker } = await setup(`start="2026-10-01" end="2026-10-15"`);
    expect([from.value, to.value]).toEqual(['01.10.2026', '15.10.2026']);
    expect(picker.value).toBe('2026-10-01/2026-10-15');
    expect(from.getAttribute('aria-label')).toBe('Zeitraum, Von');
  });

  it('accepts an interval as value (Angular forms)', async () => {
    const { page, from, to, picker } = await setup(``);
    picker.value = '2026-11-01/2026-11-07';
    await page.waitForChanges();
    expect([picker.start, picker.end, from.value, to.value]).toEqual(['2026-11-01', '2026-11-07', '01.11.2026', '07.11.2026']);
  });

  it('applies typed dates, swaps reversed ones and reports only complete ranges', async () => {
    const { from, to, picker, events, type, error } = await setup(``);
    await type(from, '15.10.2026');
    expect(events).toEqual([]);
    expect(error()).toBe('Start und Ende angeben');
    await type(to, '1.10.');
    expect([picker.start, picker.end]).toEqual(['2026-10-01', '2026-10-15']);
    expect(events).toEqual([{ start: '2026-10-01', end: '2026-10-15', value: '2026-10-01/2026-10-15' }]);
    expect(error()).toBeUndefined();
  });

  it('flags invalid, out-of-range and too long ranges', async () => {
    const { from, to, type, error } = await setup(`start="2026-10-01" end="2026-10-05" min="2026-09-01" max-days="7"`);
    await type(to, 'morgen');
    expect(error()).toBe('Kein gültiges Datum');
    await type(to, '20.10.2026');
    expect(error()).toBe('Höchstens 7 Tage');
    await type(from, '1.8.2026');
    expect(error()).toBe('Datum nicht erlaubt');
  });

  it('takes a range from the calendar', async () => {
    const { page, root, picker, events } = await setup(`start="2026-10-01" end="2026-10-05"`);
    const cal = root.querySelector('kern-calendar')!.shadowRoot!;
    cal.querySelector<HTMLButtonElement>('button[data-iso="2026-10-20"]')!.click();
    await page.waitForChanges();
    expect(events).toEqual([]);
    cal.querySelector<HTMLButtonElement>('button[data-iso="2026-10-12"]')!.click();
    await page.waitForChanges();
    expect(picker.value).toBe('2026-10-12/2026-10-20');
    expect(events).toEqual([{ start: '2026-10-12', end: '2026-10-20', value: '2026-10-12/2026-10-20' }]);
  });

  it('applies presets', async () => {
    const { page, picker } = await setup(
      ``,
      `<button slot="presets" data-range="P7D">Letzte 7 Tage</button><button slot="presets" data-start="2026-01-01" data-end="2026-01-31">Januar</button>`,
    );
    const [last7, january] = Array.from(page.root!.querySelectorAll('button'));
    last7.click();
    await page.waitForChanges();
    const today = todayIso();
    expect([picker.start, picker.end]).toEqual([addDays(today, -6), today]);
    january.click();
    await page.waitForChanges();
    expect(picker.value).toBe('2026-01-01/2026-01-31');
  });

  it('clears both dates', async () => {
    const { page, root, picker, events } = await setup(`start="2026-10-01" end="2026-10-05" clearable`);
    root.querySelector<HTMLButtonElement>('.clear')!.click();
    await page.waitForChanges();
    expect([picker.start, picker.end, picker.value]).toEqual(['', '', '']);
    expect(events).toEqual([{ start: '', end: '', value: '' }]);
  });
});
