import { expect, test, type Page } from '@playwright/test';
import { formEntries, openFixture } from './helpers';

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'form.html');
});

const initial = [
  ['host', 'nas-01'],
  ['mail', ''],
  ['vlan', ''],
  ['port', '443'],
  ['room', 'bath'],
  ['updates', 'yes'],
  ['day', '2026-10-19'],
];

test('FormData enthält die Werte aller Felder', async ({ page }) => {
  await expect.poll(() => formEntries(page)).toEqual(initial);

  await page.getByLabel('Hostname').fill('nas-02');
  await page.getByLabel('E-Mail').fill('admin@example.ch');
  await page.getByLabel('VLAN-Name').fill('vlan-20');
  await page.getByLabel('Port').fill('8443');
  await page.getByRole('combobox', { name: 'Raum' }).click();
  await page.getByRole('option', { name: 'Garage' }).click();
  await page.locator('kern-checkbox[name=updates]').click();
  await expect(page.getByRole('checkbox', { name: 'Updates' })).not.toBeChecked();
  await page.locator('kern-switch[name=cloud]').click();
  await expect(page.getByRole('switch', { name: 'Cloud' })).toBeChecked();
  await page.getByRole('textbox', { name: 'Wartung' }).fill('24.12.2026');
  await page.getByRole('textbox', { name: 'Wartung' }).press('Enter');

  const expected = [
    ['host', 'nas-02'],
    ['mail', 'admin@example.ch'],
    ['vlan', 'vlan-20'],
    ['port', '8443'],
    ['room', 'garage'],
    ['cloud', 'on'],
    ['day', '2026-12-24'],
  ];
  await expect.poll(() => formEntries(page)).toEqual(expected);

  // A submit sends the same data.
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { submits: string[][][] }).submits)).toEqual([expected]);
});

test('Reset stellt die Anfangswerte wieder her', async ({ page }) => {
  await page.getByLabel('Hostname').fill('anders');
  await page.getByRole('combobox', { name: 'Raum' }).click();
  await page.getByRole('option', { name: 'Büro' }).click();
  await page.locator('kern-checkbox[name=updates]').click();
  await expect(page.getByRole('checkbox', { name: 'Updates' })).not.toBeChecked();
  await page.locator('kern-switch[name=cloud]').click();
  await expect(page.getByRole('switch', { name: 'Cloud' })).toBeChecked();
  await page.getByRole('textbox', { name: 'Wartung' }).fill('01.02.2026');
  await page.getByRole('textbox', { name: 'Wartung' }).press('Enter');
  await expect.poll(() => formEntries(page)).not.toEqual(initial);

  await page.getByRole('button', { name: 'Zurücksetzen' }).click();

  await expect.poll(() => formEntries(page)).toEqual(initial);
  await expect(page.getByLabel('Hostname')).toHaveValue('nas-01');
  await expect(page.getByRole('combobox', { name: 'Raum' }).locator('.current')).toHaveText('Bad');
  await expect(page.getByRole('checkbox', { name: 'Updates' })).toBeChecked();
  await expect(page.getByRole('switch', { name: 'Cloud' })).not.toBeChecked();
  await expect(page.getByRole('textbox', { name: 'Wartung' })).toHaveValue('19.10.2026');
});

test('disabled fieldset sperrt die Felder und lässt sie aus FormData weg', async ({ page }) => {
  await expect(page.getByLabel('Gateway')).toBeDisabled();
  await expect(page.getByRole('switch', { name: 'MQTT' })).toBeDisabled();
  expect((await formEntries(page)).map(([k]) => k)).not.toContain('gateway');
  expect((await formEntries(page)).map(([k]) => k)).not.toContain('mqtt');
});

// #151: formDisabledCallback reflects `disabled` onto the host, which then stays disabled on its own.
test.fixme('Freigabe des fieldset gibt die Felder wieder frei (#151)', async ({ page }) => {
  await page.locator('#advanced').evaluate((f: HTMLFieldSetElement) => (f.disabled = false));

  await expect(page.getByLabel('Gateway')).toBeEnabled();
  await expect(page.getByRole('switch', { name: 'MQTT' })).toBeEnabled();
  await expect.poll(() => formEntries(page)).toEqual(expect.arrayContaining([['gateway', '192.168.1.1'], ['mqtt', 'on']]));
});

test.describe('Constraint-Validierung über ElementInternals', () => {
  const valid = (page: Page) => page.locator('form').evaluate((f: HTMLFormElement) => f.checkValidity());

  test('required', async ({ page }) => {
    await expect.poll(() => valid(page)).toBe(true);
    await page.getByLabel('Hostname').fill('');
    await expect(page.locator('kern-input[name=host]:invalid')).toHaveCount(1);
    await expect.poll(() => valid(page)).toBe(false);
  });

  test('type=email', async ({ page }) => {
    await page.getByLabel('E-Mail').fill('kein-mail');
    await expect(page.locator('kern-input[name=mail]:invalid')).toHaveCount(1);
    await page.getByLabel('E-Mail').fill('admin@example.ch');
    await expect(page.locator('kern-input[name=mail]:valid')).toHaveCount(1);
  });

  test('pattern', async ({ page }) => {
    await page.getByLabel('VLAN-Name').fill('lan-20');
    await expect(page.locator('kern-input[name=vlan]:invalid')).toHaveCount(1);
    await page.getByLabel('VLAN-Name').fill('vlan-20');
    await expect(page.locator('kern-input[name=vlan]:valid')).toHaveCount(1);
  });

  test('min/max bei Zahl und Datum', async ({ page }) => {
    await page.getByLabel('Port').fill('70000');
    await expect(page.locator('kern-input[name=port]:invalid')).toHaveCount(1);
    await page.getByLabel('Port').fill('0');
    await expect(page.locator('kern-input[name=port]:invalid')).toHaveCount(1);
    await page.getByLabel('Port').fill('22');
    await expect(page.locator('kern-input[name=port]:valid')).toHaveCount(1);

    const day = page.getByRole('textbox', { name: 'Wartung' });
    await day.fill('01.01.2027');
    await day.press('Enter');
    await expect(page.locator('kern-date-picker[name=day]:invalid')).toHaveCount(1);
    await day.fill('01.06.2026');
    await day.press('Enter');
    await expect(page.locator('kern-date-picker[name=day]:valid')).toHaveCount(1);
    await expect.poll(() => valid(page)).toBe(true);
  });

  test('reportValidity und Submit zeigen die Meldung und blockieren', async ({ page }) => {
    await page.getByLabel('E-Mail').fill('kein-mail');
    await expect(page.locator('kern-input[name=mail]:invalid')).toHaveCount(1);

    expect(await page.locator('form').evaluate((f: HTMLFormElement) => f.reportValidity())).toBe(false);
    // The browser's message is shown in the field and linked to it.
    await expect(page.getByLabel('E-Mail')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('kern-input[name=mail] .error')).not.toBeEmpty();

    await page.getByRole('button', { name: 'Speichern' }).click();
    await page.getByLabel('E-Mail').fill('admin@example.ch');
    await expect(page.locator('kern-input[name=mail]:valid')).toHaveCount(1);
    await page.getByRole('button', { name: 'Speichern' }).click();
    // Only the second, valid submit went through.
    await expect.poll(() => page.evaluate(() => (window as unknown as { submits: unknown[] }).submits.length)).toBe(1);
  });
});
