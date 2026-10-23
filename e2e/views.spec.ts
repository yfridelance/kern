import { expect, test, type Page } from '@playwright/test';
import { expectFocusInside, openFixture } from './helpers';

// Tests the example of docs/patterns/70-table-views.md itself (built by `npm run docs`), so the documented code is
// what runs. Only the example's controls are used, no prose.
const PAGE = '../patterns/table-views.html';
const STORAGE = 'kern-docs.table-views';

const heads = (page: Page) => page.locator('.tv-table thead th:not([data-kern-generated])').evaluateAll((ths) => ths.map((th) => th.getAttribute('data-key')));
const viewSelect = (page: Page) => page.getByRole('combobox', { name: 'View' });
async function chooseView(page: Page, name: string) {
  await viewSelect(page).click();
  await page.getByRole('option', { name }).click();
}
/** By keyboard: WebKit on macOS doesn't focus buttons on click, so focus return is checked from a focused button. */
async function press(page: Page, selector: string) {
  await page.locator(selector).focus();
  await page.keyboard.press('Enter');
}
const viewLabel = (page: Page) => viewSelect(page).locator('.current');
/** Statuses of all rows the table got (all pages). */
const statuses = (page: Page) => page.locator('.tv-table').evaluate((t: any) => [...new Set(t.rows.map((d: any) => d.status))].sort());

test.beforeEach(async ({ page }) => {
  await openFixture(page, PAGE);
});

test.describe('Tabellenansichten (#165)', () => {
  test('eine Ansicht setzt Spalten, Sortierung und Filter und beginnt auf Seite 1', async ({ page }) => {
    await expect.poll(() => heads(page)).toEqual(['name', 'status', 'site', 'ip', 'lastSeen']);
    await page.locator('.tv-table kern-pagination').getByRole('button', { name: /^(Seite|Page) 2$/ }).click();
    await expect.poll(() => page.locator('.tv-table').evaluate((t: any) => t.page)).toBe(2);

    await chooseView(page, 'Updates pending');
    await expect.poll(() => heads(page)).toEqual(['name', 'firmware', 'model', 'site']);
    await expect.poll(() => statuses(page)).toEqual(['update']);
    await expect(page.locator('.tv-table th[data-key="firmware"]')).toHaveAttribute('aria-sort', 'ascending');
    expect(await page.locator('.tv-table').evaluate((t: any) => t.page)).toBe(1);

    await chooseView(page, 'Offline devices');
    await expect.poll(() => heads(page)).toEqual(['name', 'lastSeen', 'site', 'ip']);
    await expect(page.locator('.tv-count')).toHaveText(/ of 60 devices$/);
  });

  test('Filterwechsel markiert die Ansicht als geändert und setzt die Seite zurück', async ({ page }) => {
    await page.locator('.tv-table kern-pagination').getByRole('button', { name: /^(Seite|Page) 3$/ }).click();
    await page.locator('kern-select[name="site"]').click();
    await page.getByRole('option', { name: 'Büro Bern' }).click();
    await page.keyboard.press('Escape');
    await expect(viewLabel(page)).toHaveText('All devices (modified)');
    expect(await page.locator('.tv-table').evaluate((t: any) => t.page)).toBe(1);
  });

  test('Spalten anpassen, speichern, nach Neuladen wiederherstellen, aktualisieren und löschen', async ({ page }) => {
    const columnsButton = page.locator('.tv-columns');
    await press(page, '.tv-columns');
    const drawer = page.locator('.tv-drawer');
    await drawer.locator('kern-table-columns li[data-key="site"] kern-checkbox').click();
    await drawer.getByRole('button', { name: 'Move Last seen up' }).click();
    await expect.poll(() => heads(page)).toEqual(['name', 'status', 'lastSeen', 'ip']);
    await drawer.locator('.tv-done').click();
    await expectFocusInside(columnsButton);
    await expect(viewLabel(page)).toHaveText('All devices (modified)');

    // Save as …: Enter in the name field saves, the focus returns to the button.
    const save = page.locator('.tv-save');
    await press(page, '.tv-save');
    const name = page.locator('.tv-dialog kern-input');
    await expectFocusInside(name);
    await page.keyboard.type('Diagnosis');
    await page.keyboard.press('Enter');
    await expect(viewLabel(page)).toHaveText('Diagnosis');
    await expectFocusInside(save);

    await page.reload();
    await openFixture(page, PAGE);
    await expect(viewLabel(page)).toHaveText('Diagnosis');
    await expect.poll(() => heads(page)).toEqual(['name', 'status', 'lastSeen', 'ip']);

    // Update: a changed sort is stored in the view.
    await page.locator('.tv-table th[data-key="ip"] button').click();
    await expect(viewLabel(page)).toHaveText('Diagnosis (modified)');
    await page.locator('.tv-update').click();
    await expect(viewLabel(page)).toHaveText('Diagnosis');
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), STORAGE);
    expect(stored.views[0]).toMatchObject({ version: 1, name: 'Diagnosis', sort: { key: 'ip', direction: 'asc' } });

    // Delete: its button goes, the focus moves to the view select.
    await press(page, '.tv-delete');
    await expect(viewLabel(page)).toHaveText('All devices');
    await expectFocusInside(page.locator('.tv-view'));
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).views, STORAGE)).toEqual([]);
  });

  test('Zurücksetzen führt zur Standardansicht mit Standardspalten', async ({ page }) => {
    await chooseView(page, 'Updates pending');
    await page.locator('.tv-columns').click();
    await page.locator('.tv-drawer kern-table-columns li[data-key="model"] kern-checkbox').click();
    await page.locator('.tv-default-columns').click();
    await expect.poll(() => heads(page)).toEqual(['name', 'status', 'site', 'ip', 'lastSeen']);
    await page.locator('.tv-done').click();
    const reset = page.locator('.tv-reset');
    await press(page, '.tv-reset');
    await expect(viewLabel(page)).toHaveText('All devices');
    await expect.poll(() => statuses(page)).toEqual(['offline', 'online', 'update']);
    await expectFocusInside(reset);
  });

  test('unbekannte Spalten, Werte und Versionen in gespeicherten Ansichten', async ({ page }) => {
    await page.evaluate((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          views: [
            { version: 1, id: 'old', name: 'Old', columns: [{ key: 'uptime' }, { key: 'firmware' }, { key: 'name' }], sort: { key: 'uptime', direction: 'asc' }, filters: { status: ['gone', 'offline'], site: [] } },
            { version: 2, id: 'future', name: 'Future', columns: [], filters: {} },
          ],
          active: 'old',
        }),
      );
    }, STORAGE);
    await page.reload();
    await openFixture(page, PAGE);
    await expect(viewLabel(page)).toHaveText('Old');
    await expect.poll(() => heads(page)).toEqual(['firmware', 'name', 'status', 'site', 'ip', 'lastSeen']);
    await expect.poll(() => statuses(page)).toEqual(['offline']);
    await viewSelect(page).click();
    await expect(page.getByRole('option')).toHaveText(['All devices', 'Offline devices', 'Updates pending', 'Old']);
    await page.keyboard.press('Escape');

    // Broken JSON: only the built-in views.
    await page.evaluate((key) => localStorage.setItem(key, '{'), STORAGE);
    await page.reload();
    await openFixture(page, PAGE);
    await expect(viewLabel(page)).toHaveText('All devices');
  });
});
