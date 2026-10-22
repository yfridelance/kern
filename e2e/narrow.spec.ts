import { expect, test, type Locator } from '@playwright/test';
import { openFixture } from './helpers';

// Headers on narrow screens (#148): nothing sticks out, nothing scrolls horizontally.
test.use({ viewport: { width: 320, height: 640 } });

test.beforeEach(async ({ page }) => {
  await openFixture(page, 'narrow.html');
});

/**
 * Elements of `host` (its shadow root and slotted children) that reach outside `box`: the body's content box by
 * default, or the element matching `box` in the shadow root (the dialog panel).
 */
async function outside(host: Locator, box?: string) {
  return host.evaluate((el, box) => {
    let ref: { left: number; right: number };
    if (box) ref = el.shadowRoot!.querySelector(box)!.getBoundingClientRect();
    else {
      const b = document.body.getBoundingClientRect();
      const s = getComputedStyle(document.body);
      ref = { left: b.left + parseFloat(s.paddingLeft), right: b.right - parseFloat(s.paddingRight) };
    }
    const els = [el, ...el.shadowRoot!.querySelectorAll('*'), ...el.children];
    return els
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.left < ref.left - 0.5 || r.right > ref.right + 0.5); })
      .map((e) => e.localName + (typeof e.className === 'string' && e.className ? `.${e.className}` : ''));
  }, box);
}

test('keine horizontale Scrollbar bei 320 px', async ({ page }) => {
  const [scrollWidth, clientWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scrollWidth, `scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`).toBeLessThanOrEqual(clientWidth);
});

test('kern-card: Aktionen rutschen unter den Titel und bleiben rechts', async ({ page }) => {
  for (const id of ['#card', '#card-long']) expect(await outside(page.locator(id)), id).toEqual([]);
  const card = page.locator('#card');
  const [heading, actions, header] = await Promise.all(
    ['.heading', '.actions', 'header'].map((s) => card.locator(s).evaluate((el) => el.getBoundingClientRect().toJSON())),
  );
  expect(actions.top).toBeGreaterThanOrEqual(heading.bottom);
  expect(header.right - actions.right).toBeLessThan(20);
});

test('kern-page-header: nichts ragt hinaus', async ({ page }) => {
  expect(await outside(page.locator('kern-page-header'))).toEqual([]);
});

for (const id of ['#dialog', '#drawer']) {
  test(`${id.slice(1)}: Kopf und Fuss bleiben im Panel`, async ({ page }) => {
    const host = page.locator(id);
    await host.evaluate((el: HTMLElement & { show(): Promise<void> }) => el.show());
    await expect(host.locator('dialog')).toBeVisible();
    const panel = host.locator('dialog');
    const [scrollWidth, clientWidth] = await panel.evaluate((d) => [d.scrollWidth, d.clientWidth]);
    expect(scrollWidth, 'Panel scrollt horizontal').toBeLessThanOrEqual(clientWidth);
    expect(await outside(host, 'dialog')).toEqual([]);
  });
}
