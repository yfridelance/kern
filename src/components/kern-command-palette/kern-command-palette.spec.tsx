import { newSpecPage } from '@stencil/core/testing';
import type { KernCommandItem } from '../../utils/command-search';
import { setKernLocale } from '../../utils/i18n';
import { KernDialog } from '../kern-dialog/kern-dialog';
import { KernCommandPalette } from './kern-command-palette';

const ITEMS: KernCommandItem[] = [
  { id: 'page-devices', label: 'Devices', group: 'Pages' },
  { id: 'page-updates', label: 'Updates', group: 'Pages', keywords: ['firmware'] },
  { id: 'dev-boiler', label: 'Boiler', description: 'Shelly Pro 3EM · 192.168.1.20', group: 'Devices', icon: 'thermometer' },
  { id: 'act-reset', label: 'Factory reset', group: 'Actions', disabled: true },
  { id: 'act-scan', label: 'Start scan', group: 'Actions' },
];

type Palette = HTMLElement & { items: KernCommandItem[]; open: boolean; shortcut: boolean; filtering: string; loading: boolean; error?: string; query: string; show(): Promise<void>; hide(): Promise<void> };

/** The test DOM has no modal dialogs; `close` fires asynchronously, as in browsers. */
const stubDialogs = (body: HTMLElement) => {
  body.querySelectorAll('kern-command-palette').forEach((p) => {
    const dialog = p.shadowRoot!.querySelector('kern-dialog')!.shadowRoot!.querySelector('dialog')! as HTMLDialogElement;
    dialog.showModal = function () {
      this.open = true;
    };
    dialog.close = function () {
      this.open = false;
      setTimeout(() => this.dispatchEvent(new Event('close')));
    };
  });
};

const tick = () => new Promise((r) => setTimeout(r));

const pages: Awaited<ReturnType<typeof newSpecPage>>[] = [];

const setup = async (html = `<kern-command-palette></kern-command-palette>`, items = ITEMS) => {
  const page = await newSpecPage({ components: [KernCommandPalette, KernDialog], html });
  pages.push(page);
  const host = page.root as Palette;
  const root = host.shadowRoot!;
  stubDialogs(page.body);
  const dialog = root.querySelector('kern-dialog')!.shadowRoot!.querySelector('dialog')! as HTMLDialogElement;
  host.items = items;
  await page.waitForChanges();
  const events: string[] = [];
  for (const name of ['kernOpen', 'kernClose', 'kernSelect', 'kernQueryChange']) {
    host.addEventListener(name, (e) => events.push(`${name}${(e as CustomEvent).detail ? ` ${JSON.stringify((e as CustomEvent).detail)}` : ''}`));
  }
  const input = () => root.querySelector('input')!;
  const options = () => Array.from(root.querySelectorAll('[role=option]'));
  const labels = () => options().map((o) => o.querySelector('.label')!.textContent);
  const active = () => root.querySelector('.option.active .label')?.textContent;
  const key = async (k: string, init: KeyboardEventInit = {}) => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true, ...init }));
    await page.waitForChanges();
  };
  const type = async (value: string) => {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    await page.waitForChanges();
  };
  const open = async () => {
    await host.show();
    await page.waitForChanges();
  };
  return { page, host, root, dialog, events, input, options, labels, active, key, type, open };
};

describe('kern-command-palette', () => {
  afterEach(async () => {
    setKernLocale();
    await tick(); // pending close events
    // Disconnect every palette, so no shortcut registration leaks into the next test.
    for (const page of pages.splice(0)) page.body.querySelectorAll('kern-command-palette').forEach((p) => p.remove());
  });

  it('renders a labelled combobox over a grouped listbox in a dialog', async () => {
    const { root, input, labels } = await setup();
    const dialog = root.querySelector('kern-dialog')!;
    expect(dialog.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Command palette');
    // No close button: Escape and the backdrop close.
    expect(dialog.shadowRoot!.querySelector('kern-button')).toBeNull();
    const listbox = root.querySelector('[role=listbox]')!;
    expect(input().getAttribute('role')).toBe('combobox');
    expect(input().getAttribute('aria-controls')).toBe(listbox.id);
    expect(input().getAttribute('placeholder')).toBe('Search pages, devices and actions …');
    const groups = Array.from(root.querySelectorAll('[role=group]'));
    expect(groups.map((g) => root.getElementById(g.getAttribute('aria-labelledby')!)!.textContent)).toEqual(['Pages', 'Devices', 'Actions']);
    expect(labels()).toEqual(['Devices', 'Updates', 'Boiler', 'Factory reset', 'Start scan']);
  });

  it('names options by label and describes them by the description', async () => {
    const { root, options } = await setup();
    const boiler = options()[2];
    expect(root.getElementById(boiler.getAttribute('aria-labelledby')!)!.textContent).toBe('Boiler');
    expect(root.getElementById(boiler.getAttribute('aria-describedby')!)!.textContent).toBe('Shelly Pro 3EM · 192.168.1.20');
    expect(boiler.querySelector('kern-icon')!.getAttribute('name')).toBe('thermometer');
    expect(options()[3].getAttribute('aria-disabled')).toBe('true');
  });

  it('opens with show(), focuses the search field and starts on the first entry', async () => {
    const { host, dialog, input, active, events, open } = await setup();
    const focus = jest.spyOn(input(), 'focus');
    await open();
    expect([host.hasAttribute('open'), dialog.open]).toEqual([true, true]);
    expect(focus).toHaveBeenCalled();
    expect(active()).toBe('Devices');
    expect(input().getAttribute('aria-activedescendant')).toBe(host.shadowRoot!.querySelector('.option.active')!.id);
    expect(events).toEqual(['kernOpen']);
  });

  it('moves with arrows, Home and End, skips disabled entries and does not wrap', async () => {
    const { active, key, open } = await setup();
    await open();
    await key('ArrowUp');
    expect(active()).toBe('Devices');
    await key('ArrowDown');
    await key('ArrowDown');
    expect(active()).toBe('Boiler');
    await key('ArrowDown');
    expect(active()).toBe('Start scan');
    await key('ArrowDown');
    expect(active()).toBe('Start scan');
    await key('Home');
    expect(active()).toBe('Devices');
    await key('End');
    expect(active()).toBe('Start scan');
    // Shift+Home selects text in the field instead.
    await key('Home', { shiftKey: true });
    expect(active()).toBe('Start scan');
  });

  it('Enter reports the id, closes and returns the focus', async () => {
    const { page, host, dialog, events, key, open } = await setup(`<button>Search</button><kern-command-palette></kern-command-palette>`);
    const button = page.body.querySelector('button')!;
    const palette = page.body.querySelector('kern-command-palette') as Palette;
    expect(palette).toBe(host);
    Object.defineProperty(page.doc, 'activeElement', { value: button, configurable: true });
    const focus = jest.spyOn(button, 'focus');
    await open();
    await key('ArrowDown');
    await key('Enter');
    expect([host.hasAttribute('open'), dialog.open]).toEqual([false, false]);
    expect(focus).toHaveBeenCalled();
    await tick();
    expect(events).toEqual(['kernOpen', 'kernSelect {"id":"page-updates"}', 'kernClose']);
  });

  it('does not choose disabled entries, by Enter or click', async () => {
    const { host, events, options, type, key, open } = await setup();
    await open();
    await type('reset');
    expect(options().length).toBe(1);
    await key('Enter');
    (options()[0] as HTMLElement).click();
    expect(host.open).toBe(true);
    expect(events.filter((e) => e.startsWith('kernSelect'))).toEqual([]);
  });

  it('chooses by click and makes the hovered entry active', async () => {
    const { page, events, options, active, open } = await setup();
    await open();
    options()[2].dispatchEvent(new Event('pointermove'));
    await page.waitForChanges();
    expect(active()).toBe('Boiler');
    options()[3].dispatchEvent(new Event('pointermove'));
    await page.waitForChanges();
    expect(active()).toBe('Boiler');
    (options()[4] as HTMLElement).click();
    expect(events).toContain('kernSelect {"id":"act-scan"}');
  });

  it('starts the list at the top when reopened', async () => {
    const { host, root, key, active, open } = await setup();
    await open();
    await key('End');
    const listbox = root.querySelector('[role=listbox]') as HTMLElement;
    listbox.scrollTop = 500;
    await host.hide();
    await open();
    expect(active()).toBe('Devices');
    expect(listbox.scrollTop).toBe(0);
  });

  it('scrolls back to the top when new results replace the active entry', async () => {
    const { page, host, root, key, active, open } = await setup();
    await open();
    await key('End');
    const listbox = root.querySelector('[role=listbox]') as HTMLElement;
    listbox.scrollTop = 500;
    host.items = ITEMS.slice(0, 3).map((i) => ({ ...i, id: `new-${i.id}` }));
    await page.waitForChanges();
    expect(active()).toBe('Devices');
    expect(listbox.scrollTop).toBe(0);
  });

  it('Escape closes without choosing', async () => {
    const { host, events, key, open } = await setup();
    await open();
    await key('Escape');
    expect(host.open).toBe(false);
    await tick();
    expect(events).toEqual(['kernOpen', 'kernClose']);
  });

  it('filters locally, highlights matches and clears the query on close', async () => {
    const { host, root, events, labels, active, type, open } = await setup();
    await open();
    await type('scan');
    expect(labels()).toEqual(['Start scan']);
    expect(root.querySelector('.option mark')!.textContent).toBe('scan');
    expect(active()).toBe('Start scan');
    await type('firm');
    expect(labels()).toEqual(['Updates']);
    await type('nothing here');
    expect(labels()).toEqual([]);
    expect(root.querySelector('[role=listbox]')!.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('kern-empty-state')!.getAttribute('variant')).toBe('no-results');
    expect(root.querySelector('kern-empty-state')!.getAttribute('heading')).toBe('No results');
    await host.hide();
    expect(host.query).toBe('');
    expect(events.filter((e) => e.startsWith('kernQueryChange'))).toEqual([
      'kernQueryChange {"query":"scan"}',
      'kernQueryChange {"query":"firm"}',
      'kernQueryChange {"query":"nothing here"}',
      'kernQueryChange {"query":""}',
    ]);
  });

  it('shows items as given with filtering="external", with loading and error states', async () => {
    const { page, host, root, labels, type, open } = await setup(`<kern-command-palette filtering="external"></kern-command-palette>`, []);
    await open();
    await type('boi');
    host.loading = true;
    await page.waitForChanges();
    expect(root.querySelector('kern-spinner')).not.toBeNull();
    expect(root.querySelector('.loading')!.textContent).toBe('Searching …');
    expect(root.querySelector('[role=listbox]')!.getAttribute('aria-busy')).toBe('true');
    expect(root.querySelector('kern-empty-state')).toBeNull();

    host.items = [ITEMS[2], ITEMS[4]];
    host.loading = false;
    await page.waitForChanges();
    expect(labels()).toEqual(['Boiler', 'Start scan']);
    expect(root.querySelector('.option mark')!.textContent).toBe('Boi');
    expect(root.querySelector('.loading')).toBeNull();

    host.error = 'Server not reachable';
    await page.waitForChanges();
    expect(labels()).toEqual([]);
    const state = root.querySelector('kern-empty-state')!;
    expect([state.getAttribute('variant'), state.textContent]).toEqual(['error', 'Server not reachable']);
  });

  it('makes the first result active again when an error is cleared', async () => {
    const { page, host, events, active, key, open } = await setup(`<kern-command-palette filtering="external"></kern-command-palette>`, []);
    await open();
    host.error = 'Request failed (500)';
    await page.waitForChanges();
    expect(active()).toBeUndefined();
    // As a search handler does it: new rows first, then the error cleared.
    host.items = ITEMS;
    host.error = undefined;
    await page.waitForChanges();
    expect(active()).toBe('Devices');
    await key('Enter');
    expect(events).toContain('kernSelect {"id":"page-devices"}');
  });

  it('keeps the active entry when the items change, else starts at the top', async () => {
    const { page, host, active, key, open } = await setup();
    await open();
    await key('End');
    host.items = [...ITEMS, { id: 'new', label: 'New page', group: 'Pages' }];
    await page.waitForChanges();
    expect(active()).toBe('Start scan');
    host.items = ITEMS.slice(0, 2);
    await page.waitForChanges();
    expect(active()).toBe('Devices');
  });

  it('announces the number of results once typing pauses', async () => {
    const pause = async () => {
      await new Promise((r) => setTimeout(r, 700));
      await page.waitForChanges();
    };
    const { page, root, type, open } = await setup();
    const status = () => root.querySelector('.sr[role=status]')!.textContent;
    await open();
    await type('pages');
    expect(status()).toBe('');
    await pause();
    expect(status()).toBe('2 results');
    await type('scan');
    await pause();
    expect(status()).toBe('1 result');
    await type('xyz');
    await pause();
    expect(status()).toBe('No results');
  });

  it('uses German texts with <html lang="de">', async () => {
    setKernLocale('de');
    const { root, input } = await setup();
    expect(input().getAttribute('placeholder')).toBe('Seiten, Geräte und Aktionen suchen …');
    expect(root.querySelector('kern-dialog')!.shadowRoot!.querySelector('dialog')!.getAttribute('aria-label')).toBe('Befehlspalette');
  });

  describe('shortcut', () => {
    const press = (init: KeyboardEventInit) => {
      const ev = new KeyboardEvent('keydown', { key: 'k', bubbles: true, cancelable: true, ...init });
      document.dispatchEvent(ev);
      return ev;
    };

    it('opens and closes with Ctrl+K or Cmd+K only when enabled', async () => {
      const { page, host } = await setup();
      press({ ctrlKey: true });
      expect(host.open).toBe(false);
      host.shortcut = true;
      await page.waitForChanges();
      expect(press({ ctrlKey: true }).defaultPrevented).toBe(true);
      expect(host.open).toBe(true);
      press({ metaKey: true });
      expect(host.open).toBe(false);
      // Other combinations and keys an app handler already took are left alone.
      for (const init of [{}, { ctrlKey: true, shiftKey: true }, { ctrlKey: true, metaKey: true }, { ctrlKey: true, key: 'j' }]) expect(press(init).defaultPrevented).toBe(false);
      const taken = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true });
      taken.preventDefault();
      document.dispatchEvent(taken);
      expect(host.open).toBe(false);
    });

    it('uses one document listener and removes it with the last palette', async () => {
      const page = await newSpecPage({ components: [KernCommandPalette, KernDialog], html: `<div></div>` });
      pages.push(page);
      const add = jest.spyOn(page.doc, 'addEventListener');
      const remove = jest.spyOn(page.doc, 'removeEventListener');
      const keydown = (spy: jest.SpyInstance) => spy.mock.calls.filter(([type]) => type === 'keydown').length;
      page.body.innerHTML = `<kern-command-palette id="a" shortcut></kern-command-palette><kern-command-palette id="b" shortcut shortcut-key="p"></kern-command-palette>`;
      await page.waitForChanges();
      stubDialogs(page.body);
      expect([keydown(add), keydown(remove)]).toEqual([1, 0]);
      const a = page.body.querySelector('#a') as Palette;
      const b = page.body.querySelector('#b') as Palette;
      press({ ctrlKey: true, key: 'p' });
      expect([a.open, b.open]).toEqual([false, true]);
      await b.hide();
      await tick();
      a.remove();
      expect(keydown(remove)).toBe(0);
      b.shortcut = false;
      await page.waitForChanges();
      expect(keydown(remove)).toBe(1);
      press({ ctrlKey: true, key: 'p' });
      expect(b.open).toBe(false);
      b.shortcut = true;
      await page.waitForChanges();
      b.remove();
      expect([keydown(add), keydown(remove)]).toEqual([2, 2]);
    });

    it('opens only the last connected palette and none over an open one', async () => {
      const { page } = await setup(`<kern-command-palette id="a" shortcut></kern-command-palette><kern-command-palette id="b" shortcut></kern-command-palette><kern-command-palette id="c"></kern-command-palette>`);
      const [a, b, c] = ['#a', '#b', '#c'].map((s) => page.body.querySelector(s) as Palette);
      press({ ctrlKey: true });
      expect([a.open, b.open]).toEqual([false, true]);
      press({ ctrlKey: true });
      expect([a.open, b.open]).toEqual([false, false]);
      c.open = true;
      await page.waitForChanges();
      expect(press({ ctrlKey: true }).defaultPrevented).toBe(false);
      expect([a.open, b.open, c.open]).toEqual([false, false, true]);
    });

    it('does not open over a modal dialog inside a shadow root', async () => {
      const { page, host } = await setup(`<kern-command-palette shortcut></kern-command-palette><div id="app"></div>`);
      const dialog = page.doc.createElement('dialog') as HTMLDialogElement;
      page.body.querySelector('#app')!.attachShadow({ mode: 'open' }).append(page.doc.createElement('section'));
      page.body.querySelector('#app')!.shadowRoot!.querySelector('section')!.append(dialog);
      dialog.open = true;
      expect(press({ ctrlKey: true }).defaultPrevented).toBe(false);
      expect(host.open).toBe(false);
      dialog.open = false;
      press({ ctrlKey: true });
      expect(host.open).toBe(true);
    });
  });
});
