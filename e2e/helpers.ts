import { expect, type Locator, type Page } from '@playwright/test';

/** Opens a fixture page and waits until every Kern component on it has rendered (Stencil's componentOnReady). */
export async function openFixture(page: Page, file: string) {
  await page.goto(file);
  await page.evaluate(async () => {
    const els = [...document.querySelectorAll('*')].filter((el) => el.localName.startsWith('kern-')) as (HTMLElement & { componentOnReady?: () => Promise<unknown> })[];
    await Promise.all(els.map(async (el) => {
      await customElements.whenDefined(el.localName);
      await el.componentOnReady?.();
    }));
  });
}

/** Whether focus is inside `host` (also inside its shadow root and slotted content). */
export async function focusInside(host: Locator): Promise<boolean> {
  return host.evaluate((root) => {
    let el: Node | null = document.activeElement;
    while (el && (el as Element).shadowRoot?.activeElement) el = (el as Element).shadowRoot!.activeElement;
    for (let n = el; n; n = (n as Element).assignedSlot ?? n.parentNode ?? (n as ShadowRoot).host ?? null) if (n === root) return true;
    return false;
  });
}

/** Asserts focus ends up inside `host`, retrying like a web-first assertion. */
export async function expectFocusInside(host: Locator, inside = true) {
  await expect.poll(() => focusInside(host), { message: `Fokus ${inside ? 'in' : 'nicht in'} ${host}` }).toBe(inside);
}

/** The form's entries as [name, value] pairs. */
export function formEntries(page: Page, selector = 'form') {
  return page.locator(selector).evaluate((f: HTMLFormElement) => [...new FormData(f)].map(([k, v]) => [k, String(v)]));
}
