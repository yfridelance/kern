import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectFocusInside, focusInside, openFixture } from './helpers';

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'modal.html');
});

/** Opens with the keyboard (WebKit does not focus buttons on click, so focus return is only defined this way). */
async function openWith(page: Page, opener: string) {
  await page.locator(opener).focus();
  await page.keyboard.press('Enter');
}

/** Tabs (forward and backward) more often than there are focusable elements; focus never reaches the page behind. */
async function expectTabStaysInside(page: Page, modal: Locator) {
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press(key);
      const onPage = await page.evaluate(() => {
        const a = document.activeElement;
        return !!a && a !== document.body && !a.closest('kern-dialog, kern-drawer');
      });
      expect(onPage, `${key} #${i + 1} landet auf der Seite hinter dem Modal`).toBe(false);
    }
  }
  // Browsers may let focus pass to their own UI between rounds; it comes back into the modal.
  await page.keyboard.press('Tab');
  await expectFocusInside(modal);
}

for (const { name, opener, host } of [
  { name: 'kern-dialog', opener: '#open-dialog', host: '#dialog' },
  { name: 'kern-drawer', opener: '#open-drawer', host: '#drawer' },
]) {
  test.describe(name, () => {
    test('Fokus geht ins Modal, Tab bleibt drin, Escape schliesst, Fokus kehrt zurück', async ({ page }) => {
      const modal = page.locator(host);
      await openWith(page, opener);
      await expect(modal.locator('dialog')).toBeVisible();
      await expectFocusInside(modal);

      await expectTabStaysInside(page, modal);

      await page.keyboard.press('Escape');
      await expect(modal.locator('dialog')).toBeHidden();
      await expect(modal).not.toHaveAttribute('open');
      await expect.poll(() => focusInside(page.locator(opener))).toBe(true);
    });

    test('Schliessen-Knopf schliesst und gibt den Fokus zurück', async ({ page }) => {
      const modal = page.locator(host);
      await openWith(page, opener);
      await expect(modal.locator('dialog')).toBeVisible();
      await modal.getByRole('button', { name: 'Schliessen' }).click();
      await expect(modal.locator('dialog')).toBeHidden();
      await expect.poll(() => focusInside(page.locator(opener))).toBe(true);
    });
  });
}

test.describe('Anfangsfokus', () => {
  for (const { name, opener, host, field } of [
    { name: 'kern-drawer', opener: '#open-drawer-form', host: '#drawer-form', field: 'IP' },
    { name: 'kern-dialog', opener: '#open-dialog-form', host: '#dialog-form', field: 'Neuer Name' },
  ]) {
    test(`${name}: autofocus an einem Kern-Feld fokussiert das innere Input, kernOpen kommt, Fokus kehrt zurück`, async ({ page }) => {
      const modal = page.locator(host);
      await openWith(page, opener);
      await expect(modal.locator('dialog')).toBeVisible();
      await expect(modal.getByRole('textbox', { name: field })).toBeFocused();
      expect(await page.evaluate(() => (window as unknown as { opened: string[] }).opened)).toEqual([host.slice(1)]);

      await page.keyboard.press('Escape');
      await expect(modal.locator('dialog')).toBeHidden();
      await expect.poll(() => focusInside(page.locator(opener))).toBe(true);
    });
  }

  test('ohne autofocus bleibt der Fokus wie bisher auf dem Schliessen-Knopf', async ({ page }) => {
    const modal = page.locator('#drawer');
    await openWith(page, '#open-drawer');
    await expect(modal.locator('dialog')).toBeVisible();
    await expectFocusInside(modal.getByRole('button', { name: 'Schliessen' }));
  });
});

test.describe('Popover im modalen kern-dialog', () => {
  test.beforeEach(async ({ page }) => {
    await openWith(page, '#open-dialog');
    await expect(page.locator('#dialog dialog')).toBeVisible();
  });

  test('kern-select liegt über dem Dialog und ist bedienbar', async ({ page }) => {
    const dialog = page.locator('#dialog');
    const trigger = dialog.getByRole('combobox', { name: 'Raum' });
    await trigger.click();
    const list = dialog.locator('kern-select [part=listbox]');
    await expect(list).toBeVisible();
    // Playwright clicks only what is hit at that point, so the option is above the dialog (top layer).
    await dialog.getByRole('option', { name: 'Garage' }).click();
    await expect(list).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger.locator('.current')).toHaveText('Garage');
    // Closing the list does not close the dialog.
    await expect(page.locator('#dialog dialog')).toBeVisible();

    await trigger.press('ArrowDown');
    await expect(list).toBeVisible();
    await expect(dialog.getByRole('listbox', { name: 'Raum' })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(trigger.locator('.current')).toHaveText('Bad');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Escape closes only the list first, then the dialog.
    await trigger.press('ArrowDown');
    await expect(list).toBeVisible();
    await expect(dialog.getByRole('listbox', { name: 'Raum' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(list).toBeHidden();
    await expect(page.locator('#dialog dialog')).toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('kern-date-picker liegt über dem Dialog und ist bedienbar', async ({ page }) => {
    const dialog = page.locator('#dialog');
    const field = dialog.getByRole('textbox', { name: 'Wartung' });
    await dialog.getByRole('button', { name: 'Kalender öffnen' }).click();
    const calendar = dialog.locator('kern-date-picker [part=calendar]');
    await expect(calendar).toBeVisible();
    await calendar.getByRole('button', { name: /22\. Oktober 2026/ }).click();
    await expect(calendar).toBeHidden();
    await expect(field).toHaveAttribute('aria-expanded', 'false');
    await expect(field).toHaveValue('22.10.2026');
    await expect(page.locator('#dialog dialog')).toBeVisible();

    // Keyboard: Arrow Down opens, arrows move, Enter picks.
    await field.press('ArrowDown');
    await expect(calendar).toBeVisible();
    await expect(calendar.getByRole('button', { name: /22\. Oktober 2026/ })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(calendar.getByRole('button', { name: /23\. Oktober 2026/ })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(calendar).toBeHidden();
    await expect(field).toHaveValue('23.10.2026');
    await expect(field).toBeFocused();
  });
});
