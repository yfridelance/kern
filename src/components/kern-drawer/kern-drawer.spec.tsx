import { newSpecPage } from '@stencil/core/testing';
import { KernDrawer } from './kern-drawer';

describe('kern-drawer', () => {
  it('renders heading, body and footer in a labelled dialog', async () => {
    const page = await newSpecPage({
      components: [KernDrawer],
      html: `<kern-drawer heading="Bad Lüftung"><p>Details</p><button slot="footer">Schliessen</button></kern-drawer>`,
    });
    const root = page.root!.shadowRoot!;
    expect(root.querySelector('dialog')!.getAttribute('aria-label')).toBe('Bad Lüftung');
    expect(root.querySelector('h2')!.textContent).toBe('Bad Lüftung');
    expect(root.querySelector('footer')!.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('dialog')!.getAttribute('style')).toContain('min(420px');
  });

  it('hides the close button and the empty footer when not dismissible', async () => {
    const page = await newSpecPage({ components: [KernDrawer], html: `<kern-drawer heading="Filter" dismissible="false" side="start" width="320"></kern-drawer>` });
    const root = page.root!.shadowRoot!;
    expect(root.querySelector('kern-button')).toBeNull();
    expect(root.querySelector('footer')!.hasAttribute('hidden')).toBe(true);
    expect(page.root!.getAttribute('side')).toBe('start');
  });

  it('reflects open and emits kernClose with the return value', async () => {
    const page = await newSpecPage({ components: [KernDrawer], html: `<kern-drawer heading="X"></kern-drawer>` });
    const drawer = page.root as unknown as KernDrawer;
    const values: string[] = [];
    page.root!.addEventListener('kernClose', (e) => values.push((e as CustomEvent).detail.returnValue));
    await drawer.show();
    await page.waitForChanges();
    expect(page.root!.hasAttribute('open')).toBe(true);
    const dialog = page.root!.shadowRoot!.querySelector('dialog')!;
    await drawer.close('saved');
    dialog.dispatchEvent(new Event('close'));
    await page.waitForChanges();
    expect([page.root!.hasAttribute('open'), values]).toEqual([false, ['saved']]);
  });

  it('emits kernOpen and focuses the first field with autofocus', async () => {
    const page = await newSpecPage({ components: [KernDrawer], html: `<kern-drawer heading="X"><kern-input name="a"></kern-input><kern-input name="b" autofocus></kern-input></kern-drawer>` });
    const dialog = page.root!.shadowRoot!.querySelector('dialog')! as HTMLDialogElement;
    dialog.showModal = function () {
      this.open = true;
    };
    const events: string[] = [];
    page.root!.addEventListener('kernOpen', () => events.push('kernOpen'));
    const b = page.root!.querySelector('[name=b]') as HTMLElement & { setFocus: () => Promise<void> };
    b.setFocus = async () => void events.push('setFocus b');
    await (page.root as unknown as KernDrawer).show();
    await page.waitForChanges();
    expect(events).toEqual(['kernOpen', 'setFocus b']);
  });
});
