import { newSpecPage } from '@stencil/core/testing';
import { KernTopbar } from './kern-topbar';

describe('kern-topbar', () => {
  it('has no menu button by default', async () => {
    const page = await newSpecPage({ components: [KernTopbar], html: `<kern-topbar app-name="App"></kern-topbar>` });
    expect(page.root!.shadowRoot!.querySelector('.menu')).toBeNull();
    expect(page.root!.shadowRoot!.querySelector('nav')!.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('shows a menu button that reports the wanted state', async () => {
    const page = await newSpecPage({ components: [KernTopbar], html: `<kern-topbar app-name="App" menu></kern-topbar>` });
    const events: boolean[] = [];
    page.root!.addEventListener('kernMenu', (e) => events.push((e as CustomEvent).detail.expanded));
    const button = page.root!.shadowRoot!.querySelector<HTMLButtonElement>('.menu')!;
    expect([button.getAttribute('aria-label'), button.getAttribute('aria-expanded')]).toEqual(['Menu', 'false']);
    button.click();
    (page.root as HTMLElement & { menuExpanded: boolean }).menuExpanded = true;
    await page.waitForChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    button.click();
    expect(events).toEqual([true, false]);
  });
});
