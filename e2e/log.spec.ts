import { expect, test, type Locator, type Page } from '@playwright/test';
import { openFixture } from './helpers';

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'log.html');
});

/** Adds `n` entries, each in its own task like a live feed. */
async function add(page: Page, n: number, max = 50) {
  for (let i = 0; i < n; i++) await page.evaluate(([m]) => (window as unknown as { logAdd: (n: number, m: number) => void }).logAdd(1, m), [max]);
}

const scroller = (log: Locator) => log.locator('.scroller');
/** Distance of the list from its bottom end (0 = at the end). */
const fromEnd = (log: Locator) => scroller(log).evaluate((sc) => Math.round(sc.scrollHeight - sc.clientHeight - sc.scrollTop));
/** Key and viewport offset of the first row reaching into view. */
const firstVisible = (log: Locator) =>
  scroller(log).evaluate((sc) => {
    const top = sc.getBoundingClientRect().top;
    const li = [...sc.querySelectorAll('li')].find((r) => r.getBoundingClientRect().bottom > top + 1)!;
    return { key: li.dataset.key, offset: Math.round(li.getBoundingClientRect().top - top) };
  });
const keys = (log: Locator) => log.locator('li.entry').evaluateAll((lis) => lis.map((li) => (li as HTMLElement).dataset.key));

test('follow: folgt am Ende, hält beim Hochscrollen die Position, «N neu» springt zurück', async ({ page }) => {
  const log = page.locator('#log');
  const latest = log.locator('.latest');
  await add(page, 30);
  await expect.poll(() => fromEnd(log)).toBeLessThanOrEqual(4);
  await expect(latest).toHaveCount(0);

  await scroller(log).evaluate((sc) => (sc.scrollTop = 60));
  await expect(latest).toHaveText('Zum Neuesten');
  const before = await firstVisible(log);
  await add(page, 5);
  expect(await firstVisible(log)).toEqual(before);
  await expect(latest).toHaveText('5 neu');

  await latest.click();
  await expect.poll(() => fromEnd(log)).toBeLessThanOrEqual(4);
  await expect(latest).toHaveCount(0);
  await expect(log.locator('li.entry').last()).toBeFocused();
  await add(page, 3);
  await expect.poll(() => fromEnd(log)).toBeLessThanOrEqual(4);
});

test('Puffer: alte Einträge fallen oben weg, die gelesenen Zeilen bleiben stehen', async ({ page }) => {
  const log = page.locator('#log');
  await add(page, 50);
  await expect(log.locator('li.entry')).toHaveCount(50);
  await scroller(log).evaluate((sc) => (sc.scrollTop = sc.scrollHeight / 2));
  const before = await firstVisible(log);
  await add(page, 10); // trims 10 at the top
  await expect.poll(async () => (await keys(log))[0]).toBe('11');
  await expect(log.locator('li.entry')).toHaveCount(50);
  expect(await firstVisible(log)).toEqual(before);
});

test('Pause friert die Ansicht ein, zählt wartende Einträge und setzt fort', async ({ page }) => {
  const log = page.locator('#log');
  await add(page, 10);
  await log.locator('kern-button.pause').click();
  await expect(log).toHaveAttribute('paused', '');
  const frozen = await keys(log);
  await add(page, 4);
  expect(await keys(log)).toEqual(frozen);
  const latest = log.locator('.latest');
  await expect(latest).toContainText('Fortsetzen');
  await expect(latest).toContainText('4 neu');
  await latest.click();
  await expect(log).not.toHaveAttribute('paused', '');
  await expect(log.locator('li.entry')).toHaveCount(14);
  await expect.poll(() => fromEnd(log)).toBeLessThanOrEqual(4);
});

test('Filter: Suche und Stufen kombiniert, keine Treffer, zurücksetzen', async ({ page }) => {
  const log = page.locator('#log');
  await add(page, 24);
  const filters: unknown[] = [];
  await page.exposeFunction('onFilter', (d: unknown) => filters.push(d));
  await log.evaluate((el) => el.addEventListener('kernFilter', (e) => (window as unknown as { onFilter: (d: unknown) => void }).onFilter((e as CustomEvent).detail)));

  await log.locator('kern-input input').fill('Eintrag 1');
  // «Eintrag 1», «Eintrag 10» … «Eintrag 19»
  await expect(log.locator('li.entry')).toHaveCount(11);
  await expect(log.locator('li.entry mark').first()).toHaveText('Eintrag 1');
  await expect(log.locator('.count')).toContainText('11 von 24');

  await log.evaluate((el: HTMLElement & { levels: string[] }) => (el.levels = ['warn']));
  await expect(log.locator('li.entry')).toHaveCount(1); // warn: ids 3, 9, 15, 21; of these only 15 matches
  await log.locator('kern-input input').fill('Eintrag 99');
  await expect(log.locator('li.entry')).toHaveCount(0);
  await expect(log.locator('kern-empty-state')).toHaveAttribute('variant', 'no-results');
  await log.locator('kern-empty-state kern-button').click();
  await expect(log.locator('li.entry')).toHaveCount(24);
  expect(filters.at(-1)).toEqual({ query: '', levels: [], sources: [] });
});

test('Kopieren: einzelner Eintrag per Knopf und Ctrl/Cmd+C, gefiltertes Ergebnis über die Toolbar', async ({ page }) => {
  const log = page.locator('#log');
  await add(page, 6);
  const copied = () => page.evaluate(() => (window as unknown as { copied: string[] }).copied);
  const row = log.locator('li.entry').nth(1);
  await row.hover();
  await row.locator('.copy').click();
  await expect.poll(copied).toEqual(['2026-10-20T08:00:02.000Z INFO [scanner] Eintrag 2']);

  await row.focus();
  await page.keyboard.press('ArrowDown');
  await expect(log.locator('li.entry').nth(2)).toBeFocused();
  await page.keyboard.press('ControlOrMeta+c');
  await expect.poll(async () => (await copied()).at(-1)).toBe('2026-10-20T08:00:03.000Z WARN [mqtt] Eintrag 3');

  await log.evaluate((el: HTMLElement & { levels: string[] }) => (el.levels = ['error']));
  await expect(log.locator('li.entry')).toHaveCount(1);
  await log.locator('kern-button.copy-all').click();
  await expect.poll(async () => (await copied()).at(-1)).toBe('2026-10-20T08:00:05.000Z ERROR [mqtt] Eintrag 5\n  {\n    "code": 5\n  }');
});

test('Tastatur und Text: Pfeile und Enter öffnen Details, HTML bleibt Text', async ({ page }) => {
  const log = page.locator('#log');
  await add(page, 6);
  await log.evaluate((el: HTMLElement & { entries: object[] }) => {
    el.entries = [...el.entries, { id: 'x', time: Date.UTC(2026, 9, 20, 9), level: 'info', message: '<img src=x onerror="window.pwned=1"><b>fett</b>' }];
  });
  await expect(log.locator('li.entry').last().locator('.message')).toHaveText('<img src=x onerror="window.pwned=1"><b>fett</b>');
  await expect(log.locator('li.entry img, li.entry b')).toHaveCount(0);

  // Tab reaches one row (the newest); arrows move.
  await log.locator('kern-button.download button').focus();
  await page.keyboard.press('Tab');
  await expect(log.locator('li.entry').last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(log.locator('li.entry').first()).toBeFocused();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown');
  const row = log.locator('li.entry').nth(4); // id 5 has details
  await expect(row).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(row.locator('.details')).toContainText('"code": 5');
  await expect(row.locator('.toggle')).toHaveAttribute('aria-expanded', 'true');
  expect(await page.evaluate(() => (window as unknown as { pwned?: number }).pwned)).toBeUndefined();
});
