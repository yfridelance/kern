import { newSpecPage } from '@stencil/core/testing';
import { KernCalendar } from './kern-calendar';

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernCalendar], html: `<kern-calendar locale="de-CH" ${attrs}></kern-calendar>` });
  const root = page.root!.shadowRoot!;
  const events: unknown[] = [];
  page.root!.addEventListener('kernChange', (e) => events.push((e as CustomEvent).detail));
  const months: unknown[] = [];
  page.root!.addEventListener('kernMonthChange', (e) => months.push((e as CustomEvent).detail));
  const day = (iso: string) => root.querySelector<HTMLButtonElement>(`button[data-iso="${iso}"]`)!;
  const active = () => root.querySelector('button[data-iso][tabindex="0"]')!.getAttribute('data-iso');
  const key = async (k: string, shiftKey = false) => {
    root.querySelector('.months')!.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey, bubbles: true }));
    await page.waitForChanges();
  };
  return { page, root, events, months, day, active, key };
};

describe('kern-calendar', () => {
  it('shows the month of the value with the locale week start', async () => {
    const { root, day } = await setup(`value="2026-10-19"`);
    expect(root.querySelector('.title')!.textContent).toBe('Oktober 2026');
    expect(Array.from(root.querySelectorAll('thead th')).map((th) => th.textContent)).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
    expect(day('2026-10-19').classList.contains('selected')).toBe(true);
    expect(day('2026-10-19').getAttribute('aria-label')).toBe('Montag, 19. Oktober 2026');
    expect(day('2026-10-19').tabIndex).toBe(0);
    expect(root.querySelectorAll('button[data-iso]').length).toBe(42);
  });

  it('honours first-day-of-week and week numbers', async () => {
    const { root } = await setup(`value="2026-10-19" first-day-of-week="0" show-week-numbers`);
    expect(Array.from(root.querySelectorAll('thead th')).map((th) => th.textContent)).toEqual(['KW', 'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']);
    expect(root.querySelector('tbody td.week')!.textContent).toBe('39');
  });

  it('picks a day on click', async () => {
    const { page, events, day } = await setup(`value="2026-10-19"`);
    day('2026-10-21').click();
    await page.waitForChanges();
    expect(events).toEqual([{ value: '2026-10-21' }]);
    expect(page.root!.getAttribute('value')).toBe('2026-10-19'); // property changes, attribute stays
    expect((page.root as unknown as KernCalendar).value).toBe('2026-10-21');
  });

  it('moves with the keyboard and changes month', async () => {
    const { root, months, active, key } = await setup(`value="2026-10-31"`);
    await key('ArrowRight');
    expect(active()).toBe('2026-11-01');
    expect(root.querySelector('.title')!.textContent).toBe('November 2026');
    await key('Home');
    expect(active()).toBe('2026-10-26');
    await key('End');
    expect(active()).toBe('2026-11-01');
    await key('PageUp', true);
    expect(active()).toBe('2025-11-01');
    expect(months).toEqual([
      { year: 2026, month: 11 },
      { year: 2026, month: 10 },
      { year: 2026, month: 11 },
      { year: 2025, month: 11 },
    ]);
  });

  it('respects min, max and isDateDisabled', async () => {
    const { page, root, events, day, active, key } = await setup(`value="2026-10-19" min="2026-10-10" max="2026-10-25"`);
    expect(root.querySelector('.prev')!.hasAttribute('disabled')).toBe(true);
    expect(root.querySelector('.next')!.hasAttribute('disabled')).toBe(true);
    expect(day('2026-10-09').getAttribute('aria-disabled')).toBe('true');
    day('2026-10-09').click();
    await key('ArrowDown');
    await key('ArrowDown');
    expect(active()).toBe('2026-10-25');
    (page.root as unknown as KernCalendar).isDateDisabled = (iso) => iso === '2026-10-20';
    await page.waitForChanges();
    day('2026-10-20').click();
    expect(events).toEqual([]);
  });

  it('picks a range in either order and previews it', async () => {
    const { page, root, events, day } = await setup(`range value="2026-10-19"`);
    day('2026-10-15').click();
    await page.waitForChanges();
    day('2026-10-10').dispatchEvent(new MouseEvent('mouseenter'));
    await page.waitForChanges();
    expect(root.querySelectorAll('td.preview').length).toBe(6);
    day('2026-10-10').click();
    await page.waitForChanges();
    expect(events).toEqual([{ start: '2026-10-10', end: '2026-10-15' }]);
    expect(root.querySelectorAll('td.in-range').length).toBe(6);
    expect(root.querySelectorAll('td.preview').length).toBe(0);
  });

  it('restores the previous range on Escape', async () => {
    const { page, day, key } = await setup(`range start="2026-10-01" end="2026-10-05"`);
    day('2026-10-20').click();
    await page.waitForChanges();
    await key('Escape');
    const cal = page.root as unknown as KernCalendar;
    expect([cal.start, cal.end]).toEqual(['2026-10-01', '2026-10-05']);
  });

  it('shows two months without outside days', async () => {
    const { root } = await setup(`value="2026-10-19" months="2"`);
    expect(Array.from(root.querySelectorAll('.title')).map((t) => t.textContent)).toEqual(['Oktober 2026', 'November 2026']);
    expect(root.querySelectorAll('button[data-iso].outside').length).toBe(0);
    expect(root.querySelectorAll('.prev').length + root.querySelectorAll('.next').length).toBe(2);
  });

  it('ends two months at max', async () => {
    const { root } = await setup(`value="2026-10-19" months="2" max="2026-10-31"`);
    expect(Array.from(root.querySelectorAll('.title')).map((t) => t.textContent)).toEqual(['September 2026', 'Oktober 2026']);
  });
});
