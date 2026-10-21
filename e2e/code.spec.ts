import { expect, test, type Locator } from '@playwright/test';
import { openFixture } from './helpers';

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'code.html');
});

/** Appends `n` lines to the log's `code`, each in its own task like a live log. */
async function append(log: Locator, n: number) {
  for (let i = 0; i < n; i++) {
    await log.evaluate((el: HTMLElement & { code?: string }, line) => {
      el.code = `${el.code ? `${el.code}\n` : ''}${line}`;
    }, `Zeile ${i + 1}`);
  }
}

/** Distance of the log's <pre> from its bottom end (0 = at the end). */
const fromEnd = (log: Locator) => log.evaluate((el) => {
  const pre = el.shadowRoot!.querySelector('pre')!;
  return Math.round(pre.scrollHeight - pre.clientHeight - pre.scrollTop);
});

test('follow: folgt neuen Zeilen am Ende, bleibt beim Hochscrollen stehen, «Zum Neuesten» springt zurück', async ({ page }) => {
  const log = page.locator('#log');
  const latest = log.locator('.latest');
  await append(log, 30);
  await expect.poll(() => fromEnd(log)).toBeLessThanOrEqual(4);
  await expect(latest).toHaveCount(0);

  // Scrolled up, the position stays while lines arrive.
  await log.evaluate((el) => {
    el.shadowRoot!.querySelector('pre')!.scrollTop = 0;
  });
  await expect(latest).toBeVisible();
  await append(log, 5);
  expect(await log.evaluate((el) => el.shadowRoot!.querySelector('pre')!.scrollTop)).toBe(0);
  await expect(latest).toHaveText('Zum Neuesten');

  await latest.click();
  await expect.poll(() => fromEnd(log)).toBeLessThanOrEqual(4);
  await expect(latest).toHaveCount(0);
  await append(log, 5);
  await expect.poll(() => fromEnd(log)).toBeLessThanOrEqual(4);
});
