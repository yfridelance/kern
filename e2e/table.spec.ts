import { expect, test } from '@playwright/test';
import { openFixture } from './helpers';

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'table.html');
});

// Each focus test runs with moveBefore (Chromium keeps focus itself) and without it (the table restores focus).
for (const move of [true, false]) {
  test.describe(`Fokus ${move ? 'mit' : 'ohne'} moveBefore`, () => {
    test.beforeEach(async ({ page }) => {
      if (!move) await page.evaluate(() => (window as any).withoutMoveBefore());
    });

    test('Fokus auf einem Button bleibt, auch wenn seine Zeile verschoben wird', async ({ page }) => {
      // The last row: reversing the order moves it to the top (detached and inserted again without moveBefore).
      const button = page.getByRole('button', { name: 'Neustart Rollladen Süd' });
      await button.focus();
      await page.evaluate(() => (window as any).tick(true));
      await expect(page.locator('tbody tr:not([kern-details]) td:not([data-kern-generated])').first()).toHaveText('Rollladen Süd');
      await expect(button).toBeFocused();
    });

    test('Fokus im Shadow DOM einer Zelle (kern-code) bleibt beim Verschieben', async ({ page }) => {
      // By its label, not its position: the position changes with the order.
      const pre = page.locator('#logs pre[aria-label="Log Bad Lüftung"]');
      await pre.focus();
      await expect(pre).toBeFocused();
      // [Bad Lüftung, Küche Licht]: the focused row moves before the other one.
      await page.evaluate(() => (window as any).swapLogs());
      await expect(page.locator('#logs tbody tr').first()).toContainText('Bad Lüftung');
      await expect(pre).toBeFocused();
      expect(await pre.evaluate((el) => (el.getRootNode() as ShadowRoot).activeElement === el)).toBe(true);
    });
  });
}

test.describe('kern-table im Datenmodus (#149)', () => {
  test('Fokus auf einem Button in einer Zelle überlebt neue rows', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Neustart Bad Lüftung' });
    await button.focus();
    await expect(button).toBeFocused();

    await page.evaluate(() => (window as any).tick());
    await expect(page.locator('tbody tr').filter({ hasText: 'Bad Lüftung' }).locator('td.num')).toHaveText('21');
    await expect(button).toBeFocused();

    // The row moves: focus stays on the same button.
    await page.evaluate(() => (window as any).tick(true));
    await expect(page.locator('tbody tr:not([kern-details]) td:not([data-kern-generated])').first()).toHaveText('Rollladen Süd');
    await expect(button).toBeFocused();
  });

  test('offene Details behalten Inhalt und Scrollposition', async ({ page }) => {
    await page.locator('tbody tr').filter({ hasText: 'Küche Licht' }).locator('[kern-expand]').click();
    const log = page.locator('tr[kern-details][data-kern-open] pre');
    await expect(log).toBeVisible();
    await log.evaluate((el) => (el.scrollTop = 200));
    await log.evaluate((el) => ((el as any).marker = true));

    await page.evaluate(() => (window as any).tick(true));
    await page.evaluate(() => (window as any).tick());
    await expect(page.locator('tbody tr').filter({ hasText: 'Küche Licht' }).locator('td.num')).toHaveText('12');
    expect(await log.evaluate((el) => (el as any).marker === true && el.scrollTop)).toBe(200);
  });
});
