import { newSpecPage } from '@stencil/core/testing';
import { KernLog } from './kern-log';
import type { KernLogEntry } from './log';
import { setKernLocale } from '../../utils/i18n';

const entries = (n: number, from = 1): KernLogEntry[] =>
  Array.from({ length: n }, (_, i) => ({
    id: from + i,
    time: Date.UTC(2026, 9, 20, 8, 0, from + i),
    level: ['info', 'warn', 'error', 'debug'][(from + i) % 4],
    source: (from + i) % 2 ? 'mqtt' : 'scanner',
    message: `Entry ${from + i}`,
  }));

async function setup(html = '<kern-log></kern-log>') {
  const page = await newSpecPage({ components: [KernLog], html });
  const log = page.root as HTMLElement & KernLog;
  const rows = () => Array.from(page.root!.shadowRoot!.querySelectorAll('li.entry')) as HTMLLIElement[];
  return { page, log, rows };
}

describe('kern-log', () => {
  it('renders entries as text, never as HTML', async () => {
    const { page, log, rows } = await setup();
    log.entries = [{ id: 'a', time: '2026-10-20T08:00:00Z', level: 'warn', source: 'mqtt', message: '<img src=x onerror=alert(1)>' }];
    await page.waitForChanges();
    const row = rows()[0];
    expect(row.querySelector('.message')!.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(row.querySelector('img')).toBeNull();
    expect(row.querySelector('.level')!.textContent).toBe('WARN');
    expect(row.querySelector('.source')!.textContent).toBe('mqtt');
    expect(row.querySelector('time')!.getAttribute('datetime')).toBe('2026-10-20T08:00:00.000Z');
  });

  it('keeps rows per id and shows only the newest max-entries', async () => {
    const { page, log, rows } = await setup('<kern-log max-entries="5"></kern-log>');
    log.entries = entries(5);
    await page.waitForChanges();
    const third = rows()[2];
    log.entries = [...entries(5), ...entries(2, 6)];
    await page.waitForChanges();
    expect(rows().map((r) => r.dataset.key)).toEqual(['3', '4', '5', '6', '7']);
    expect(rows()[0]).toBe(third);
  });

  it('does not change the app array', async () => {
    const { page, log } = await setup('<kern-log max-entries="2"></kern-log>');
    const list = entries(4);
    log.entries = list;
    await page.waitForChanges();
    expect(list.length).toBe(4);
  });

  it('filters by query, levels and sources and marks matches', async () => {
    const { page, log, rows } = await setup();
    log.entries = entries(12);
    log.query = 'entry 1';
    await page.waitForChanges();
    expect(rows().map((r) => r.dataset.key)).toEqual(['1', '10', '11', '12']);
    expect(rows()[0].querySelector('mark')!.textContent).toBe('Entry 1');
    log.levels = ['warn', 'error'];
    log.sources = ['mqtt'];
    await page.waitForChanges();
    // 1 warn mqtt, 10 error scanner, 11 debug mqtt, 12 info scanner
    expect(rows().map((r) => r.dataset.key)).toEqual(['1']);
    expect(page.root!.shadowRoot!.querySelector('.count')!.textContent).toContain('1 of 12');
  });

  it('shows the empty and the no-results state', async () => {
    const { page, log } = await setup();
    const root = page.root!.shadowRoot!;
    expect(root.querySelector('kern-empty-state')!.getAttribute('variant')).toBeNull();
    log.entries = entries(3);
    log.query = 'nothing';
    await page.waitForChanges();
    expect(root.querySelector('kern-empty-state')!.getAttribute('variant')).toBe('no-results');
  });

  it('freezes the rows while paused and counts the waiting entries', async () => {
    const { page, log, rows } = await setup('<kern-log follow></kern-log>');
    log.entries = entries(3);
    await page.waitForChanges();
    log.paused = true;
    await page.waitForChanges();
    log.entries = [...entries(3), ...entries(4, 4)];
    await page.waitForChanges();
    expect(rows().length).toBe(3);
    const latest = page.root!.shadowRoot!.querySelector('.latest')!;
    expect(latest.textContent).toContain('Resume');
    expect(latest.textContent).toContain('4 new');
    log.paused = false;
    await page.waitForChanges();
    expect(rows().length).toBe(7);
  });

  it('emits kernPause and kernFilter for user changes', async () => {
    const { page, log } = await setup();
    log.entries = entries(3);
    await page.waitForChanges();
    const pause = jest.fn();
    const filter = jest.fn();
    log.addEventListener('kernPause', (e) => pause((e as CustomEvent).detail));
    log.addEventListener('kernFilter', (e) => filter((e as CustomEvent).detail));
    (page.root!.shadowRoot!.querySelector('kern-button.pause') as HTMLElement).click();
    await page.waitForChanges();
    expect(pause).toHaveBeenCalledWith({ paused: true });
    expect(log.paused).toBe(true);
    page.root!.shadowRoot!.querySelector('kern-input')!.dispatchEvent(new CustomEvent('kernInput', { detail: { value: 'x' } }));
    await page.waitForChanges();
    expect(filter).toHaveBeenCalledWith({ query: 'x', levels: [], sources: [] });
  });

  it('opens details with Enter and keeps them open through updates', async () => {
    const { page, log, rows } = await setup();
    log.entries = [{ id: 1, time: 0, level: 'error', message: 'Failed', details: { code: 7 } }];
    await page.waitForChanges();
    rows()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await page.waitForChanges();
    expect(rows()[0].querySelector('.details')!.textContent).toBe('{\n  "code": 7\n}');
    log.entries = [...log.entries, ...entries(1, 2)];
    await page.waitForChanges();
    expect(rows()[0].querySelector('.details')).not.toBeNull();
    expect(rows()[0].querySelector('.toggle')!.getAttribute('aria-expanded')).toBe('true');
  });

  it('puts one row in the tab order', async () => {
    const { page, log, rows } = await setup();
    log.entries = entries(4);
    await page.waitForChanges();
    expect(rows().map((r) => r.tabIndex)).toEqual([-1, -1, -1, 0]);
  });

  it('returns the shown entries as text', async () => {
    const { page, log } = await setup();
    log.entries = entries(3);
    log.levels = ['warn'];
    await page.waitForChanges();
    expect(await log.getText()).toBe('2026-10-20T08:00:01.000Z WARN [mqtt] Entry 1');
  });

  it('rebuilds the row labels when the language changes', async () => {
    const { page, log, rows } = await setup();
    log.entries = entries(1);
    await page.waitForChanges();
    expect(rows()[0].querySelector('.copy')!.getAttribute('aria-label')).toBe('Copy entry');
    setKernLocale('de');
    await page.waitForChanges();
    expect(rows()[0].querySelector('.copy')!.getAttribute('aria-label')).toBe('Eintrag kopieren');
    setKernLocale();
  });
});
