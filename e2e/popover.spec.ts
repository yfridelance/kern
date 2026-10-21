import { expect, test, type Page } from '@playwright/test';
import { openFixture } from './helpers';

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'popover.html');
});

test.describe('kern-select', () => {
  const trigger = (page: Page) => page.getByRole('combobox', { name: 'Raum' });
  const list = (page: Page) => page.locator('kern-select [part=listbox]');
  // Open: the list is shown and has the focus (moved there in the next frame), so keys go to it.
  const expectOpen = async (page: Page) => {
    await expect(list(page)).toBeVisible();
    await expect(page.getByRole('listbox', { name: 'Raum' })).toBeFocused();
  };
  // Closed: hidden and the component has seen the popover's toggle event.
  const expectClosed = async (page: Page) => {
    await expect(list(page)).toBeHidden();
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
  };

  test('vollständige Auswahl mit der Tastatur', async ({ page }) => {
    // Focused directly: WebKit on macOS skips buttons with Tab by default.
    await trigger(page).focus();
    await expect(trigger(page)).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expectOpen(page);
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
    // The selected option is active first.
    await expect(page.getByRole('option', { name: 'Bad' })).toHaveClass(/active/);

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Garage' })).toHaveClass(/active/);
    await page.keyboard.press('End');
    await expect(page.getByRole('option', { name: 'Büro' })).toHaveClass(/active/);
    await page.keyboard.press('Home');
    await expect(page.getByRole('option', { name: 'Küche' })).toHaveClass(/active/);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expectClosed(page);
    await expect(trigger(page).locator('.current')).toHaveText('Bad');
    await expect(trigger(page)).toBeFocused();

    // Space opens and picks as well.
    await page.keyboard.press(' ');
    await expectOpen(page);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press(' ');
    await expectClosed(page);
    await expect(trigger(page).locator('.current')).toHaveText('Küche');
    await expect(trigger(page)).toBeFocused();

    // Tab moves on to the next field.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('combobox', { name: 'Gerät' })).toBeFocused();
  });

  test('Escape schliesst ohne Änderung und gibt den Fokus zurück', async ({ page }) => {
    await trigger(page).focus();
    await page.keyboard.press('Enter');
    await expectOpen(page);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');

    await expectClosed(page);
    await expect(trigger(page).locator('.current')).toHaveText('Bad');
    await expect(trigger(page)).toBeFocused();
  });

  test('Klick ausserhalb schliesst die Liste (Light-Dismiss)', async ({ page }) => {
    await trigger(page).click();
    await expectOpen(page);
    await page.locator('#outside').click();
    await expectClosed(page);
    await expect(trigger(page).locator('.current')).toHaveText('Bad');

    // A click on the trigger while open closes it and does not reopen it.
    await trigger(page).click();
    await expectOpen(page);
    await trigger(page).click();
    await expectClosed(page);
  });
});

test.describe('kern-input mit suggestions (Combobox)', () => {
  const input = (page: Page) => page.getByRole('combobox', { name: 'Gerät' });
  const list = (page: Page) => page.locator('kern-input [part=listbox]');

  test('vollständige Auswahl mit der Tastatur', async ({ page }) => {
    await input(page).focus();
    await page.keyboard.type('bad');
    await expect(list(page)).toBeVisible();
    await expect(page.getByRole('option')).toHaveText(['Bad Lüftung', 'Bad Heizung']);

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Bad Lüftung' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Bad Heizung' })).toHaveAttribute('aria-selected', 'true');
    await expect(input(page)).toHaveAttribute('aria-activedescendant', /opt-1$/);
    await page.keyboard.press('Enter');

    await expect(list(page)).toBeHidden();
    await expect(input(page)).toHaveValue('Bad Heizung');
    await expect(input(page)).toBeFocused();

    // Arrow keys open the list again, Arrow Up starts at the end.
    await input(page).fill('');
    await page.keyboard.press('Escape');
    await expect(list(page)).toBeHidden();
    await page.keyboard.press('ArrowUp');
    await expect(list(page)).toBeVisible();
    await expect(page.getByRole('option', { name: 'Bad Heizung' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Tab');
    await expect(list(page)).toBeHidden();
  });

  test('Escape schliesst und behält den Text und den Fokus', async ({ page }) => {
    await input(page).focus();
    await page.keyboard.type('kü');
    await expect(list(page)).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(list(page)).toBeHidden();
    await expect(input(page)).toHaveValue('kü');
    await expect(input(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(input(page)).toBeFocused();
  });

  test('Klick ausserhalb schliesst die Liste (Light-Dismiss)', async ({ page }) => {
    await input(page).click();
    await page.keyboard.type('l');
    await expect(list(page)).toBeVisible();
    await page.locator('#outside').click();
    await expect(list(page)).toBeHidden();
    await expect(input(page)).toHaveValue('l');
  });

  test('Klick auf einen Vorschlag übernimmt ihn', async ({ page }) => {
    await input(page).click();
    await page.keyboard.type('süd');
    await page.getByRole('option', { name: 'Rollladen Süd' }).click();
    await expect(list(page)).toBeHidden();
    await expect(input(page)).toHaveValue('Rollladen Süd');
    await expect(input(page)).toBeFocused();
  });
});
