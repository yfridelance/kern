import { newSpecPage } from '@stencil/core/testing';
import { KernMenuItem } from '../kern-menu-item/kern-menu-item';
import { KernMenu } from './kern-menu';

const html = `<kern-menu label="Aktionen">
  <button slot="trigger">⋯</button>
  <kern-menu-item value="reboot" icon="power">Neustart</kern-menu-item>
  <kern-menu-item>Snapshot</kern-menu-item>
  <hr>
  <kern-menu-item value="reset" tone="danger">Werksreset</kern-menu-item>
  <kern-menu-item value="delete" disabled>Löschen</kern-menu-item>
</kern-menu>`;

const setup = async () => {
  const page = await newSpecPage({ components: [KernMenu, KernMenuItem], html });
  const events: string[] = [];
  page.root!.addEventListener('kernSelect', (e) => events.push((e as CustomEvent).detail.value));
  const items = Array.from(page.root!.querySelectorAll('kern-menu-item')) as HTMLElement[];
  return { page, events, items, trigger: page.root!.querySelector('button')! };
};

describe('kern-menu', () => {
  it('marks the trigger and renders a labelled menu', async () => {
    const { page, trigger, items } = await setup();
    expect([trigger.getAttribute('aria-haspopup'), trigger.getAttribute('aria-expanded')]).toEqual(['menu', 'false']);
    const menu = page.root!.shadowRoot!.querySelector('[role="menu"]')!;
    expect(menu.getAttribute('aria-label')).toBe('Aktionen');
    expect(items.map((i) => i.getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'menuitem', 'menuitem']);
    expect(items.map((i) => i.getAttribute('tabindex'))).toEqual(['-1', '-1', '-1', '-1']);
    expect(items[0].shadowRoot!.querySelector('svg.icon')).not.toBeNull();
  });

  it('emits kernSelect with the value or the text, not for disabled items', async () => {
    const { page, items, events } = await setup();
    items[0].click();
    items[1].click();
    items[3].click();
    items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await page.waitForChanges();
    expect(events).toEqual(['reboot', 'Snapshot', 'reset']);
    expect(items[3].getAttribute('aria-disabled')).toBe('true');
    expect(items[2].getAttribute('tone')).toBe('danger');
  });
});
