import { expect, test } from '@playwright/test';
import { expectFocusInside, openFixture } from './helpers';

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'timeline.html');
});

test('Details: per Tastatur auf- und zuklappen', async ({ page }) => {
  const item = page.locator('#update');
  const toggle = item.locator('.toggle');
  const details = item.locator('.details');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveText('Details ausblenden');
  await expect(details).toBeVisible();
  await expect(toggle).toBeFocused();

  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(details).toBeHidden();
});

test('neue Ereignisse oben einfügen: Fokus bleibt auf der Aktion', async ({ page }) => {
  const action = page.locator('#log');
  await action.focus();
  await page.evaluate(() => {
    const el = document.createElement('kern-timeline-item');
    el.setAttribute('heading', 'Verbindung verloren');
    el.setAttribute('tone', 'danger');
    document.getElementById('history')!.prepend(el);
  });
  await expect(page.locator('#history kern-timeline-item').first()).toHaveAttribute('heading', 'Verbindung verloren');
  await expect(action).toBeFocused();
});

test('Weitere laden: Ansage, Fokus bleibt am Button, danach auf dem ersten neuen Ereignis', async ({ page }) => {
  const history = page.locator('#history');
  const more = history.locator('.more kern-button');
  const status = history.locator('[role="status"]');
  await expect(more).toHaveText('Weitere laden');

  await more.locator('button').focus();
  await page.keyboard.press('Enter');
  await expect(more).toHaveAttribute('busy', '');
  await expect(history.locator('kern-timeline-item')).toHaveCount(5);
  await expect(more).not.toHaveAttribute('busy', '');
  await expect(status).toHaveText('3 weitere Ereignisse geladen');
  await expectFocusInside(more);

  // Last page: the button goes away, focus moves to the first new event.
  await page.keyboard.press('Enter');
  await expect(history.locator('kern-timeline-item')).toHaveCount(8);
  await expect(more).toHaveCount(0);
  await expect(page.locator('#history kern-timeline-item').nth(5)).toBeFocused();
  await expect(status).toHaveText('3 weitere Ereignisse geladen');
});

test('Weitere laden mit Live-Ereignis oben: Ansage und Fokus gelten der neuen Seite', async ({ page }) => {
  const history = page.locator('#history');
  const more = history.locator('.more kern-button');
  const status = history.locator('[role="status"]');
  const live = () => page.evaluate(() => {
    const el = document.createElement('kern-timeline-item');
    el.setAttribute('heading', 'Live');
    document.getElementById('history')!.prepend(el);
  });
  await more.locator('button').focus();
  await page.keyboard.press('Enter');
  await live();
  await expect(history.locator('kern-timeline-item')).toHaveCount(6);
  await expect(status).toHaveText('3 weitere Ereignisse geladen');

  // Last page: focus goes to its first event, not to an older one shifted by the live event.
  await page.keyboard.press('Enter');
  await live();
  await expect(more).toHaveCount(0);
  await expect(history.locator('kern-timeline-item[heading="Live"]')).toHaveCount(2);
  await expect(page.locator('#history kern-timeline-item').nth(7)).toBeFocused();
  expect(await page.locator('#history kern-timeline-item').nth(7).evaluate((el) => (el as HTMLElement & { heading: string }).heading)).toBe('Seite 2 Ereignis 1');
});

test('Weitere laden: wer während des Ladens weitergeht, behält seinen Fokus', async ({ page }) => {
  const history = page.locator('#history');
  const more = history.locator('.more kern-button');
  await more.locator('button').focus();
  await page.keyboard.press('Enter');
  await expect(history.locator('kern-timeline-item')).toHaveCount(5);
  await expectFocusInside(more);

  await page.keyboard.press('Enter');
  await page.locator('#log').focus();
  await expect(more).toHaveCount(0);
  await expect(history.locator('kern-timeline-item')).toHaveCount(8);
  await page.waitForTimeout(100);
  await expect(page.locator('#log')).toBeFocused();
});

test('Lesepunkt: neue Ereignisse oben verschieben die gelesenen nicht', async ({ page }) => {
  // A handle, not a locator: nth(10) would be another event after the insert.
  const reading = (await page.locator('#feed kern-timeline-item').nth(10).elementHandle())!;
  const top = () => reading.evaluate((el) => Math.round(el.getBoundingClientRect().top - document.getElementById('feed-box')!.getBoundingClientRect().top));
  // Scroll the box (not the page) so the event is near its top.
  await reading.evaluate((el) => {
    const box = document.getElementById('feed-box')!;
    box.scrollTop += el.getBoundingClientRect().top - box.getBoundingClientRect().top - 20;
  });
  const before = await top();
  await page.waitForTimeout(100); // the timeline notes the reading point after scrolling

  await page.evaluate(() => (window as unknown as { prependFeed(n: number): void }).prependFeed(3));
  await expect(page.locator('#feed kern-timeline-item')).toHaveCount(33);
  await page.waitForTimeout(100);
  expect(Math.abs((await top()) - before)).toBeLessThanOrEqual(2);
});
