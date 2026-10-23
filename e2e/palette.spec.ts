import { expect, test, type Page } from '@playwright/test';
import { focusInside, openFixture } from './helpers';

type Win = Window & { selected: string[]; queries: string[]; keydownListeners: Set<unknown> };

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'palette.html');
  await page.waitForFunction(() => Array.isArray((window as unknown as Win).selected));
});

const palette = (page: Page, id = '#palette') => page.locator(id);
const selected = (page: Page) => page.evaluate(() => (window as unknown as Win).selected);

/** Opens with the keyboard (WebKit does not focus buttons on click, so focus return is only defined this way). */
async function openWithButton(page: Page) {
  await page.locator('#open').focus();
  await page.keyboard.press('Enter');
  await expect(palette(page).locator('dialog')).toBeVisible();
  await expect(palette(page).getByRole('combobox')).toBeFocused();
}

/** The label of the active option (the one the combobox points to). */
async function activeLabel(page: Page) {
  const combo = palette(page).getByRole('combobox');
  const id = await combo.getAttribute('aria-activedescendant');
  if (!id) return null;
  return palette(page).locator(`[id="${id}"] .label`).textContent();
}

test('Button öffnet, Fokus im Suchfeld, Escape schliesst, Fokus kehrt zurück', async ({ page }) => {
  await openWithButton(page);
  await expect(palette(page)).toHaveAttribute('open');
  await page.keyboard.press('Escape');
  await expect(palette(page).locator('dialog')).toBeHidden();
  await expect(palette(page)).not.toHaveAttribute('open');
  await expect.poll(() => focusInside(page.locator('#open'))).toBe(true);
});

test('Ctrl/Cmd+K öffnet und schliesst, Fokus kehrt ins Feld zurück', async ({ page }) => {
  await page.locator('#field').focus();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(palette(page).locator('dialog')).toBeVisible();
  await expect(palette(page).getByRole('combobox')).toBeFocused();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(palette(page).locator('dialog')).toBeHidden();
  await expect(page.locator('#field')).toBeFocused();
});

test('Pfeile, Home und End bewegen die Auswahl, deaktivierte werden übersprungen, Enter wählt', async ({ page }) => {
  await openWithButton(page);
  await expect.poll(() => activeLabel(page)).toBe('Geräte');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => activeLabel(page)).toBe('Updates');
  await page.keyboard.press('End');
  await expect.poll(() => activeLabel(page)).toBe('Scan starten');
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => activeLabel(page)).toBe('Küche Licht');
  await page.keyboard.press('Home');
  await expect.poll(() => activeLabel(page)).toBe('Geräte');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => activeLabel(page)).toBe('Boiler');
  await page.keyboard.press('Enter');
  await expect(palette(page).locator('dialog')).toBeHidden();
  expect(await selected(page)).toEqual(['palette:dev-boiler']);
  await expect.poll(() => focusInside(page.locator('#open'))).toBe(true);
});

test('Lokale Suche ohne Akzente hebt den Treffer hervor und sagt die Anzahl an', async ({ page }) => {
  await openWithButton(page);
  await page.keyboard.type('kuche');
  const options = palette(page).getByRole('option');
  await expect(options).toHaveCount(1);
  await expect(options.first().locator('mark')).toHaveText('Küche');
  await expect(palette(page).getByRole('status')).toHaveText('1 Treffer');
  await page.keyboard.press('Enter');
  expect(await selected(page)).toEqual(['palette:dev-kitchen']);
  // Closing clears the search.
  expect(await page.evaluate(() => (window as unknown as Win).queries.at(-1))).toBe('');

  await openWithButton(page);
  await page.keyboard.type('zzz');
  await expect(options).toHaveCount(0);
  await expect(palette(page).locator('kern-empty-state')).toContainText('Keine Treffer');
  await expect(palette(page).getByRole('status').first()).toHaveText('Keine Treffer');
});

test('Deaktivierte Einträge lassen sich weder mit Enter noch per Klick ausführen', async ({ page }) => {
  await openWithButton(page);
  await page.keyboard.type('werk');
  const reset = palette(page).getByRole('option', { name: 'Werksreset' });
  await expect(reset).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Enter');
  await reset.click({ force: true });
  await expect(palette(page).locator('dialog')).toBeVisible();
  expect(await selected(page)).toEqual([]);
});

test('Klick auf einen Eintrag wählt, Klick auf den Hintergrund schliesst', async ({ page }) => {
  await openWithButton(page);
  await palette(page).getByRole('option', { name: 'Updates' }).click();
  await expect(palette(page).locator('dialog')).toBeHidden();
  expect(await selected(page)).toEqual(['palette:page-updates']);

  await openWithButton(page);
  await page.mouse.click(5, 5);
  await expect(palette(page).locator('dialog')).toBeHidden();
  expect(await selected(page)).toEqual(['palette:page-updates']);
});

test('Mehrere Instanzen lösen sich nicht gegenseitig aus', async ({ page }) => {
  // Another palette is open: the shortcut does not open a second one on top.
  await page.locator('#open-other').focus();
  await page.keyboard.press('Enter');
  await expect(palette(page, '#other').locator('dialog')).toBeVisible();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(palette(page).locator('dialog')).toBeHidden();
  await expect(palette(page, '#other').locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(palette(page, '#other').locator('dialog')).toBeHidden();

  // Two palettes with the shortcut: only one opens (the last connected).
  await page.evaluate(async () => {
    const p = document.createElement('kern-command-palette') as HTMLElement & { items: unknown; shortcut: boolean; componentOnReady(): Promise<unknown> };
    p.id = 'second';
    p.shortcut = true;
    p.items = [{ id: 'y', label: 'Zweite' }];
    document.body.append(p);
    await p.componentOnReady();
  });
  await page.locator('#field').focus();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(palette(page, '#second').locator('dialog')).toBeVisible();
  await expect(palette(page).locator('dialog')).toBeHidden();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(palette(page, '#second').locator('dialog')).toBeHidden();
  await expect(palette(page).locator('dialog')).toBeHidden();
});

test('Beim Wiederöffnen ist der aktive Eintrag sichtbar', async ({ page }) => {
  await page.evaluate(() => {
    const p = document.getElementById('palette') as HTMLElement & { items: unknown };
    p.items = Array.from({ length: 60 }, (_, i) => ({ id: `dev-${i}`, label: `Gerät ${i}`, group: 'Geräte' }));
  });
  await openWithButton(page);
  await page.keyboard.press('End');
  await expect.poll(() => activeLabel(page)).toBe('Gerät 59');
  await page.keyboard.press('Escape');
  await expect(palette(page).locator('dialog')).toBeHidden();

  await openWithButton(page);
  await expect.poll(() => activeLabel(page)).toBe('Gerät 0');
  const visible = () =>
    palette(page).locator('[role=listbox]').evaluate((list) => {
      const active = list.querySelector('.option.active')!.getBoundingClientRect();
      const box = list.getBoundingClientRect();
      return active.top >= box.top && active.bottom <= box.bottom;
    });
  await expect.poll(visible).toBe(true);
  await page.keyboard.press('Enter');
  expect(await selected(page)).toEqual(['palette:dev-0']);
});

test('Neue externe Resultate: der aktive erste Treffer ist sichtbar', async ({ page }) => {
  const setItems = (prefix: string) =>
    page.evaluate((prefix) => {
      const p = document.getElementById('palette') as HTMLElement & { items: unknown; filtering: string };
      p.filtering = 'external';
      p.items = Array.from({ length: 60 }, (_, i) => ({ id: `${prefix}-${i}`, label: `${prefix} ${i}`, group: 'Geräte' }));
    }, prefix);
  await setItems('alt');
  await openWithButton(page);
  await page.keyboard.press('End');
  await expect.poll(() => activeLabel(page)).toBe('alt 59');

  await setItems('neu');
  await expect.poll(() => activeLabel(page)).toBe('neu 0');
  const visible = () =>
    palette(page).locator('[role=listbox]').evaluate((list) => {
      const active = list.querySelector('.option.active')!.getBoundingClientRect();
      const box = list.getBoundingClientRect();
      return active.top >= box.top && active.bottom <= box.bottom;
    });
  await expect.poll(visible).toBe(true);
  await page.keyboard.press('Enter');
  expect(await selected(page)).toEqual(['palette:neu-0']);
});

test('Nach einem aufgehobenen Fehler wählt Enter den ersten Treffer', async ({ page }) => {
  await openWithButton(page);
  await page.evaluate(() => {
    const p = document.getElementById('palette') as HTMLElement & { filtering: string; error?: string };
    p.filtering = 'external';
    p.error = 'Request failed (500)';
  });
  await expect(palette(page).locator('kern-empty-state')).toContainText('Request failed (500)');
  await page.evaluate(() => {
    const p = document.getElementById('palette') as HTMLElement & { items: unknown; error?: string };
    p.items = [{ id: 'dev-boiler', label: 'Boiler', group: 'Geräte' }];
    p.error = undefined;
  });
  await expect.poll(() => activeLabel(page)).toBe('Boiler');
  await page.keyboard.press('Enter');
  expect(await selected(page)).toEqual(['palette:dev-boiler']);
});

test('Ctrl/Cmd+K öffnet nicht über einem Modal in einem Shadow Root', async ({ page }) => {
  await page.evaluate(async () => {
    const host = document.createElement('div');
    host.id = 'shadow-host';
    document.body.append(host);
    const dialog = document.createElement('kern-dialog') as HTMLElement & { heading: string; show(): Promise<void>; componentOnReady(): Promise<unknown> };
    dialog.heading = 'Im Shadow Root';
    dialog.innerHTML = '<input aria-label="Name">';
    host.attachShadow({ mode: 'open' }).append(dialog);
    await customElements.whenDefined('kern-dialog');
    await dialog.componentOnReady();
    await dialog.show();
  });
  const dialog = page.locator('#shadow-host kern-dialog dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(palette(page).locator('dialog')).toBeHidden();
  await expect(palette(page)).not.toHaveAttribute('open');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  // Afterwards the shortcut works again.
  await page.keyboard.press('ControlOrMeta+k');
  await expect(palette(page).locator('dialog')).toBeVisible();
});

test('Sofort wieder geöffnet bleibt offen (verspätetes close-Event des Dialogs)', async ({ page }) => {
  await page.evaluate(async () => {
    const p = document.getElementById('palette') as HTMLElement & { open: boolean; show(): Promise<void> };
    await p.show();
    // Closing queues the native close event; reopening in the same task must not be undone by it.
    p.open = false;
    p.open = true;
    await new Promise((r) => setTimeout(r, 100));
  });
  await expect(palette(page).locator('dialog')).toBeVisible();
  await expect(palette(page)).toHaveAttribute('open');
});

test('Der Shortcut-Listener wird beim Entfernen und Abschalten aufgeräumt', async ({ page }) => {
  const count = () => page.evaluate(() => (window as unknown as Win).keydownListeners.size);
  const before = await count();
  // Switching the shortcut off removes the listener, switching it on adds it again.
  await page.evaluate(() => ((document.getElementById('palette') as HTMLElement & { shortcut: boolean }).shortcut = false));
  await expect.poll(count).toBe(before - 1);
  await page.locator('#field').focus();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(palette(page).locator('dialog')).toBeHidden();
  await page.evaluate(() => ((document.getElementById('palette') as HTMLElement & { shortcut: boolean }).shortcut = true));
  await expect.poll(count).toBe(before);

  // Removing the element removes it too.
  await page.evaluate(() => document.getElementById('palette')!.remove());
  await expect.poll(count).toBe(before - 1);
  await page.locator('#field').focus();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.locator('kern-command-palette[open]')).toHaveCount(0);
  await expect(page.locator('#field')).toBeFocused();
});
