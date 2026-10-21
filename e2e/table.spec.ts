import { expect, test } from '@playwright/test';
import { openFixture } from './helpers';

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'table.html');
});

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
