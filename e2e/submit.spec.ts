import { expect, test, type Page } from '@playwright/test';
import { openFixture } from './helpers';

// Enter in a Kern text field submits the surrounding form, like a native field (#155).

type Submit = { form: string; submitter: string | null; data: [string, string][] };

const submits = (page: Page) => page.evaluate(() => (window as unknown as { submits: Submit[] }).submits);
const field = (page: Page, name: string) => page.locator(`[name=${name}] input`).first();
// The submit runs in a task after the keydown; wait past it before checking that none came.
const settle = (page: Page) => page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 100)));

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'submit.html');
});

test('Enter sendet mit aktuellem FormData ab, über den Standard-Button', async ({ page }) => {
  await field(page, 'host').fill('nas-02');
  await field(page, 'host').press('Enter');
  await expect.poll(() => submits(page)).toEqual([
    {
      form: 'device',
      submitter: 'save',
      data: [['host', 'nas-02'], ['net', '192.168.1.0/24'], ['mac', ''], ['count', '2'], ['floor', ''], ['note', '']],
    },
  ]);
});

test('typisierte Felder übernehmen den Text vor dem Absenden', async ({ page }) => {
  const last = async () => Object.fromEntries((await submits(page)).at(-1)?.data ?? []);

  await field(page, 'net').fill(' 10.0.0.0/8 ');
  await field(page, 'net').press('Enter');
  await expect.poll(last).toMatchObject({ net: '10.0.0.0/8' });

  await field(page, 'mac').fill('c82b961a3f00');
  await field(page, 'mac').press('Enter');
  await expect.poll(last).toMatchObject({ mac: 'C8:2B:96:1A:3F:00' });

  await field(page, 'count').fill('5');
  await field(page, 'count').press('Enter');
  await expect.poll(last).toMatchObject({ count: '5' });

  expect(await submits(page)).toHaveLength(3);
});

test('ungültiges Pflichtfeld oder ungültige Eingabe: kein submit', async ({ page }) => {
  await field(page, 'host').fill('');
  await field(page, 'host').press('Enter');
  await expect(page.locator('kern-input[name=host]:invalid')).toHaveCount(1);

  await field(page, 'host').fill('nas-02');
  await field(page, 'net').fill('192.168.1.300');
  await field(page, 'net').press('Enter');
  await expect(page.locator('kern-ip-input[name=net]:invalid')).toHaveCount(1);

  await settle(page);
  expect(await submits(page)).toEqual([]);
});

test('offene Vorschlagsliste: Enter übernimmt nur, geschlossen wird abgesendet', async ({ page }) => {
  const input = field(page, 'floor');
  await input.fill('geschoss');
  await expect(input).toHaveAttribute('aria-expanded', 'true');

  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(input).toHaveValue('Erdgeschoss');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await settle(page);
  expect(await submits(page)).toEqual([]);

  // Open without an active suggestion: Enter only closes the list.
  await input.fill('Kel');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.press('Enter');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await settle(page);
  expect(await submits(page)).toEqual([]);

  await input.press('Enter');
  await expect.poll(async () => Object.fromEntries((await submits(page))[0]?.data ?? [])).toMatchObject({ floor: 'Kel' });
});

test('no-implicit-submit und gesperrter Standard-Button: kein submit', async ({ page }) => {
  await field(page, 'note').fill('nur Text');
  await field(page, 'note').press('Enter');
  await field(page, 'other').press('Enter');
  // Shift+Enter is not an implicit submission either.
  await field(page, 'host').press('Shift+Enter');
  await settle(page);
  expect(await submits(page)).toEqual([]);

  // The same fields still submit through the button.
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect.poll(async () => (await submits(page)).length).toBe(1);
});

test('preventDefault() am Host oder am Formular verhindert das Absenden', async ({ page }) => {
  await page.locator('kern-input[name=host]').evaluate((el) => el.addEventListener('keydown', (e) => e.preventDefault(), { once: true }));
  await field(page, 'host').press('Enter');
  await page.locator('form#device').evaluate((el) => el.addEventListener('keydown', (e) => e.preventDefault(), { once: true }));
  await field(page, 'host').press('Enter');
  await settle(page);
  expect(await submits(page)).toEqual([]);

  // Without a listener, Enter submits again.
  await field(page, 'host').press('Enter');
  await expect.poll(async () => (await submits(page)).length).toBe(1);
});

test('kern-button als Standard-Button wird angeklickt, busy blockiert', async ({ page }) => {
  const clicks = () => page.evaluate(() => (window as unknown as { kernClicks: number }).kernClicks);
  await field(page, 'kern').press('Enter');
  await expect.poll(async () => (await submits(page)).map((s) => s.form)).toEqual(['kern']);
  expect(await clicks()).toBe(1);

  await page.locator('kern-button').evaluate((el) => el.setAttribute('busy', ''));
  await field(page, 'kern').press('Enter');
  await settle(page);
  expect(await submits(page)).toHaveLength(1);

  await page.locator('kern-button').evaluate((el) => {
    el.removeAttribute('busy');
    el.setAttribute('disabled', '');
  });
  await field(page, 'kern').press('Enter');
  await settle(page);
  expect(await submits(page)).toHaveLength(1);
  expect(await clicks()).toBe(1);
});

test('gesperrter Bild-Button mit form="…" ist der Standard-Button', async ({ page }) => {
  await field(page, 'image').press('Enter');
  await settle(page);
  expect(await submits(page)).toEqual([]);

  // Enabled, it submits as the submitter.
  await page.locator('input[type=image]').evaluate((el: HTMLInputElement) => (el.disabled = false));
  await field(page, 'image').press('Enter');
  await expect.poll(async () => (await submits(page)).map((s) => [s.form, s.submitter])).toEqual([['image', 'img']]);
});
