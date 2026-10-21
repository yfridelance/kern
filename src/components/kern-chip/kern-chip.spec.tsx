import { newSpecPage } from '@stencil/core/testing';
import { KernChip } from './kern-chip';

const setup = async (html: string) => {
  const page = await newSpecPage({ components: [KernChip], html });
  const removed: string[] = [];
  page.root!.addEventListener('kernRemove', (e) => removed.push((e as CustomEvent).detail.value));
  return { page, root: page.root!.shadowRoot!, removed };
};

describe('kern-chip', () => {
  it('shows the text without a × by default', async () => {
    const { page, root } = await setup(`<kern-chip tone="ok">online</kern-chip>`);
    expect(page.root!.textContent).toBe('online');
    expect(page.root!.getAttribute('tone')).toBe('ok');
    expect(page.root!.getAttribute('size')).toBe('md');
    expect(root.querySelector('.remove')).toBeNull();
  });

  it('emits kernRemove with the value on ×', async () => {
    const { root, removed } = await setup(`<kern-chip removable value="site:bern">Site: Büro Bern</kern-chip>`);
    const button = root.querySelector<HTMLButtonElement>('.remove')!;
    expect(button.getAttribute('aria-label')).toBe('Remove Site: Büro Bern');
    button.click();
    expect(removed).toEqual(['site:bern']);
  });

  it('falls back to the text and removes with Delete and Backspace', async () => {
    const { root, removed } = await setup(`<kern-chip removable> Kitchen </kern-chip>`);
    const button = root.querySelector('.remove')!;
    for (const key of ['Delete', 'Backspace', 'Enter']) button.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    expect(removed).toEqual(['Kitchen', 'Kitchen']);
  });

  it('uses label-remove with {label}', async () => {
    const { root } = await setup(`<kern-chip removable label-remove="{label} entfernen">offline</kern-chip>`);
    expect(root.querySelector('.remove')!.getAttribute('title')).toBe('offline entfernen');
  });
});

describe('kern-chip text changes', () => {
  const original = (global as any).MutationObserver;
  const observers: { cb: () => void; target?: Node; disconnected: boolean }[] = [];
  beforeAll(() => {
    // The test DOM has no MutationObserver: a stand-in that the test triggers by hand.
    (global as any).MutationObserver = class {
      entry: { cb: () => void; target?: Node; disconnected: boolean };
      constructor(cb: () => void) {
        this.entry = { cb, disconnected: false };
        observers.push(this.entry);
      }
      observe(target: Node) {
        this.entry.target = target;
      }
      disconnect() {
        this.entry.disconnected = true;
      }
    };
  });
  afterAll(() => ((global as any).MutationObserver = original));

  it('updates the × label when the text node changes and disconnects when removed', async () => {
    const { page, root } = await setup(`<kern-chip removable>Before</kern-chip>`);
    const own = observers.filter((o) => o.target === page.root);
    expect(own.length).toBe(1);
    page.root!.firstChild!.textContent = 'After';
    observers.forEach((o) => !o.disconnected && o.cb());
    await page.waitForChanges();
    expect(root.querySelector('.remove')!.getAttribute('aria-label')).toBe('Remove After');
    page.root!.parentNode!.removeChild(page.root!);
    await page.waitForChanges();
    expect(own[0].disconnected).toBe(true);
  });
});
