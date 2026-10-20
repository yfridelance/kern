import { newSpecPage } from '@stencil/core/testing';
import { toast } from '../../utils/toast';
import { KernToast } from './kern-toast';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernToast], html: `<kern-toast ${attrs}>Snapshot gespeichert</kern-toast>` });
  const reasons: string[] = [];
  page.root!.addEventListener('kernClose', (e) => reasons.push((e as CustomEvent).detail.reason));
  return { page, root: page.root!.shadowRoot!, host: page.root!, reasons };
};

describe('kern-toast', () => {
  it('closes itself after the duration', async () => {
    const { reasons } = await setup(`duration="40"`);
    await wait(20);
    expect(reasons).toEqual([]);
    await wait(40);
    expect(reasons).toEqual(['timeout']);
  });

  it('pauses while hovered', async () => {
    const { host, reasons } = await setup(`duration="40"`);
    host.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(70);
    expect(reasons).toEqual([]);
    host.dispatchEvent(new MouseEvent('mouseleave'));
    await wait(60);
    expect(reasons).toEqual(['timeout']);
  });

  it('closes with the × or the action, once', async () => {
    const { page, root, host, reasons } = await setup(`duration="0" action-label="Rückgängig" tone="danger"`);
    let actions = 0;
    host.addEventListener('kernAction', () => actions++);
    expect(host.getAttribute('role')).toBe('alert');
    root.querySelector<HTMLButtonElement>('.action')!.click();
    root.querySelector<HTMLButtonElement>('.close')!.click();
    await page.waitForChanges();
    expect([actions, reasons]).toEqual([1, ['action']]);
  });

  it('stays without duration', async () => {
    const { reasons } = await setup(`duration="0"`);
    await wait(50);
    expect(reasons).toEqual([]);
  });
});

describe('toast()', () => {
  it('stacks toasts in a live region and resolves with the reason', async () => {
    const page = await newSpecPage({ components: [KernToast], html: `<div></div>` });
    const done = toast({ message: 'Neustart gesendet', tone: 'ok', duration: 30 });
    await page.waitForChanges();
    const region = page.doc.querySelector('.kern-toasts')!;
    expect([region.getAttribute('aria-live'), region.querySelectorAll('kern-toast').length]).toEqual(['polite', 1]);
    expect(region.querySelector('kern-toast')!.textContent).toBe('Neustart gesendet');
    expect(await done).toBe('timeout');
    expect(region.querySelectorAll('kern-toast').length).toBe(0);
  });

  it('names the region with setToastRegionLabel, also after it exists', async () => {
    const page = await newSpecPage({ components: [KernToast], html: `<div></div>` });
    // A fresh module: the region is created once per page and would be the previous test's otherwise.
    let mod!: typeof import('../../utils/toast');
    jest.isolateModules(() => (mod = require('../../utils/toast')));
    mod.setToastRegionLabel('Notifications');
    const done = mod.toast({ message: 'Saved', duration: 20 });
    await page.waitForChanges();
    const region = page.doc.querySelector('.kern-toasts')!;
    expect(region.getAttribute('aria-label')).toBe('Notifications');
    mod.setToastRegionLabel('Mitteilungen');
    expect(region.getAttribute('aria-label')).toBe('Mitteilungen');
    await done;
  });
});
