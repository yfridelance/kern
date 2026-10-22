import { expect, test, type Page } from '@playwright/test';
import { openFixture } from './helpers';

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'columns.html');
});

const heads = (page: Page) => page.locator('#table thead th:not([data-kern-generated])').evaluateAll((ths) => ths.map((th) => th.getAttribute('data-key')));
const item = (page: Page, key: string) => page.locator(`#picker li[data-key="${key}"]`);

test.describe('Spaltenzustand (#165)', () => {
  test('Spalte per Checkbox aus- und einblenden', async ({ page }) => {
    await expect.poll(() => heads(page)).toEqual(['name', 'ip', 'model', 'site', 'action']);
    const box = item(page, 'model').getByRole('checkbox', { name: 'Modell' });
    await item(page, 'model').locator('kern-checkbox').click(); // the native input is invisible
    await expect.poll(() => heads(page)).toEqual(['name', 'ip', 'site', 'action']);
    await expect(page.locator('#table tbody tr:not([kern-details])').first().locator('td:not([data-kern-generated])')).toHaveCount(4);
    // Keyboard: Space on the focused checkbox shows it again; the focus stays (WebKit doesn't focus on click).
    await box.focus();
    await page.keyboard.press('Space');
    await expect.poll(() => heads(page)).toEqual(['name', 'ip', 'model', 'site', 'action']);
    await expect(box).toBeFocused();
    // Gerät can't be hidden.
    await expect(item(page, 'name').getByRole('checkbox')).toBeDisabled();
  });

  test('Mindestzahl sichtbarer Spalten', async ({ page }) => {
    await page.evaluate(() => (window as any).setState([{ key: 'ip', hidden: true }, { key: 'model', hidden: true }, { key: 'site', hidden: true }]));
    await expect.poll(() => heads(page)).toEqual(['name', 'action']);
    await expect(item(page, 'action').getByRole('checkbox')).toBeDisabled();
    await expect(item(page, 'ip').getByRole('checkbox')).toBeEnabled();
  });

  test('Reihenfolge per Tastatur; der Fokus bleibt auf dem Button', async ({ page }) => {
    const down = page.getByRole('button', { name: 'IP nach unten' });
    await down.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => heads(page)).toEqual(['name', 'model', 'ip', 'site', 'action']);
    await expect(down).toBeFocused();
    await expect(page.locator('#picker [role="status"]')).toHaveText('IP: Position 3 von 5');
    await page.keyboard.press('Space');
    await expect.poll(() => heads(page)).toEqual(['name', 'model', 'site', 'ip', 'action']);
    // Last of its group: the focus moves to the other button.
    await expect(down).toBeDisabled();
    await expect(page.getByRole('button', { name: 'IP nach oben' })).toBeFocused();
    // Alt+↑ on the checkbox moves the column, the focus stays on the checkbox.
    const box = item(page, 'site').getByRole('checkbox');
    await box.focus();
    await page.keyboard.press('Alt+ArrowUp');
    await expect.poll(() => heads(page)).toEqual(['name', 'site', 'model', 'ip', 'action']);
    await expect(box).toBeFocused();
  });

  test('Alt+↓ auf der Checkbox: der Fokus bleibt dort, die Leertaste blendet danach aus', async ({ page }) => {
    // Moving down moves the row itself in the DOM, which drops the focus (review on #177).
    const box = item(page, 'ip').getByRole('checkbox', { name: 'IP' });
    await box.focus();
    await page.keyboard.press('Alt+ArrowDown');
    await expect.poll(() => heads(page)).toEqual(['name', 'model', 'ip', 'site', 'action']);
    await expect(box).toBeFocused();
    await page.keyboard.press('Space');
    await expect.poll(() => heads(page)).toEqual(['name', 'model', 'site', 'action']);
    await expect(box).toBeFocused();
    await expect(box).not.toBeChecked();
  });

  test('Fokus in einer Zelle bleibt beim Umordnen der Spalten', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Neustart Bad Lüftung' });
    await button.focus();
    await page.evaluate(() => (window as any).setState([{ key: 'name', pinned: 'start' }, { key: 'site' }, { key: 'action' }, { key: 'ip' }]));
    // The state names no pin for «Aktion»: it scrolls with the others now.
    await expect.poll(() => heads(page)).toEqual(['name', 'site', 'action', 'ip', 'model']);
    await page.evaluate(() => (window as any).setState([{ key: 'name', pinned: 'start' }, { key: 'action' }, { key: 'site' }, { key: 'ip' }, { key: 'model' }]));
    await expect.poll(() => heads(page)).toEqual(['name', 'action', 'site', 'ip', 'model']);
    await expect(button).toBeFocused();
  });

  test('fixierte Spalten bleiben beim horizontalen Scrollen, ohne Auswahl- und Detailspalte zu überdecken', async ({ page }) => {
    const table = page.locator('#table');
    const row = page.locator('#table tbody tr:not([kern-details])').first();
    const box = async (sel: string) => (await row.locator(sel).boundingBox())!;
    const before = { select: await box('[data-kern-select]'), expand: await box('[data-kern-expand]'), name: await box('td:not([data-kern-generated]) >> nth=0') };
    expect(await table.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    await table.evaluate((el) => (el.scrollLeft = 300));
    await expect.poll(() => table.evaluate((el) => el.scrollLeft)).toBeGreaterThan(200);
    const after = { select: await box('[data-kern-select]'), expand: await box('[data-kern-expand]'), name: await box('td:not([data-kern-generated]) >> nth=0') };
    expect(after.select.x).toBeCloseTo(before.select.x, 0);
    expect(after.expand.x).toBeCloseTo(before.expand.x, 0);
    expect(after.name.x).toBeCloseTo(before.name.x, 0);
    expect(after.expand.x).toBeGreaterThanOrEqual(after.select.x + after.select.width - 1);
    expect(after.name.x).toBeGreaterThanOrEqual(after.expand.x + after.expand.width - 1);
    // The end column sits at the right edge of the visible area.
    const frame = (await table.boundingBox())!;
    const action = await box('td:last-child');
    expect(action.x + action.width).toBeCloseTo(frame.x + frame.width - 1, -1);
    // A scrolled cell passes under the pinned name, not over it.
    const ip = await box('td:not([data-kern-generated]) >> nth=1');
    if (ip.x < after.name.x + after.name.width) {
      const top = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('td')?.textContent, [after.name.x + 4, after.name.y + after.name.height / 2]);
      expect(top).toBe('Küche Licht');
    }
    // The header follows the same offsets.
    const th = (await page.locator('#table th[data-key="name"]').boundingBox())!;
    expect(th.x).toBeCloseTo(after.name.x, 0);
  });
});
