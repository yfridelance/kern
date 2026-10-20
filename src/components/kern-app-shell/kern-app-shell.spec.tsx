import { newSpecPage } from '@stencil/core/testing';
import { setKernLocale } from '../../utils/i18n';
import { KernDrawer } from '../kern-drawer/kern-drawer';
import { KernTopbar } from '../kern-topbar/kern-topbar';
import { KernAppShell } from './kern-app-shell';

const setup = async (inner: string, attrs = '') => {
  const page = await newSpecPage({ components: [KernAppShell, KernTopbar, KernDrawer], html: `<kern-app-shell ${attrs}>${inner}</kern-app-shell>` });
  const shell = page.root as HTMLElement & { sidebarOpen: boolean; toggleSidebar(open?: boolean): Promise<void> };
  const instance = page.rootInstance as KernAppShell;
  const events: boolean[] = [];
  shell.addEventListener('kernSidebarToggle', (e) => events.push((e as CustomEvent).detail.open));
  const narrow = async () => {
    instance.wide = false;
    await page.waitForChanges();
  };
  return { page, shell, root: shell.shadowRoot!, events, narrow };
};

const TOPBAR = `<kern-topbar slot="topbar" app-name="App"></kern-topbar>`;
const SIDEBAR = `<nav slot="sidebar"><a href="/devices">Devices</a></nav>`;

describe('kern-app-shell', () => {
  afterEach(() => setKernLocale());

  it('is a page frame without a sidebar', async () => {
    const { root } = await setup(`${TOPBAR}<p>Content</p>`);
    expect(root.querySelector('nav.sidebar')).toBeNull();
    expect(root.querySelector('kern-drawer')).toBeNull();
    expect(root.querySelector('main .content slot')).not.toBeNull();
    expect(root.querySelector('footer')!.hidden).toBe(true);
  });

  it('puts the sidebar next to the content when wide', async () => {
    const { root, page } = await setup(`${TOPBAR}${SIDEBAR}<span slot="footer">v1</span>`);
    const nav = root.querySelector('nav.sidebar')!;
    expect(nav.getAttribute('aria-label')).toBe('Navigation');
    expect(nav.querySelector('slot[name="sidebar"]')).not.toBeNull();
    expect(root.querySelector('footer')!.hidden).toBe(false);
    expect((page.root!.querySelector('kern-topbar') as HTMLElement & { menu: boolean }).menu).toBe(false);
  });

  it('turns the sidebar into a drawer opened by the topbar menu when narrow', async () => {
    const { page, root, shell, events, narrow } = await setup(`${TOPBAR}${SIDEBAR}`);
    await narrow();
    const drawer = root.querySelector('kern-drawer') as HTMLElement & { open: boolean };
    expect(drawer.querySelector('nav[aria-label="Navigation"] slot[name="sidebar"]')).not.toBeNull();
    const bar = page.root!.querySelector('kern-topbar') as HTMLElement & { menu: boolean; menuExpanded: boolean };
    expect(bar.menu).toBe(true);
    bar.shadowRoot!.querySelector<HTMLButtonElement>('.menu')!.click();
    await page.waitForChanges();
    expect([shell.sidebarOpen, drawer.open, bar.menuExpanded]).toEqual([true, true, true]);
    expect(events).toEqual([true]);
  });

  it('closes the drawer on a link click', async () => {
    const { page, root, shell, events, narrow } = await setup(`${TOPBAR}${SIDEBAR}`);
    await narrow();
    await shell.toggleSidebar(true);
    await page.waitForChanges();
    const link = page.root!.querySelector('a')!;
    root.querySelector('kern-drawer')!.dispatchEvent(Object.assign(new MouseEvent('click', { bubbles: true }), { composedPath: () => [link] }));
    await page.waitForChanges();
    expect(shell.sidebarOpen).toBe(false);
    expect(events).toEqual([true, false]);
  });

  it('focuses the main content after a link click once the drawer has closed', async () => {
    const { page, root, shell, narrow } = await setup(`${TOPBAR}${SIDEBAR}`);
    await narrow();
    await shell.toggleSidebar(true);
    await page.waitForChanges();
    const main = root.querySelector('main')!;
    const focus = jest.fn();
    main.focus = focus;
    const drawer = root.querySelector('kern-drawer')!;
    drawer.dispatchEvent(Object.assign(new MouseEvent('click', { bubbles: true }), { composedPath: () => [page.root!.querySelector('a')] }));
    await page.waitForChanges();
    expect(focus).not.toHaveBeenCalled(); // the modal dialog is still open
    drawer.dispatchEvent(new CustomEvent('kernClose', { detail: { returnValue: '' } }));
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('focusMain() focuses the main content, after the drawer when it is open', async () => {
    const { page, root, shell, narrow } = await setup(`${TOPBAR}${SIDEBAR}`);
    const main = root.querySelector('main')!;
    const focus = jest.fn();
    main.focus = focus;
    await (shell as unknown as KernAppShell).focusMain();
    expect(focus).toHaveBeenCalledTimes(1);
    await narrow();
    await shell.toggleSidebar(true);
    await page.waitForChanges();
    await (shell as unknown as KernAppShell).focusMain();
    expect(focus).toHaveBeenCalledTimes(1);
    root.querySelector('kern-drawer')!.dispatchEvent(new CustomEvent('kernClose', { detail: { returnValue: '' } }));
    expect(focus).toHaveBeenCalledTimes(2);
  });

  it('does not open a drawer when wide or without a sidebar', async () => {
    const { shell, events } = await setup(`${TOPBAR}${SIDEBAR}`);
    await shell.toggleSidebar(true);
    expect([shell.sidebarOpen, events]).toEqual([false, []]);
  });

  it('skips to the content and names it in the Kern language', async () => {
    const { page, root } = await setup(`${TOPBAR}<p>Content</p>`);
    const skip = root.querySelector<HTMLAnchorElement>('.skip')!;
    expect(skip.textContent).toBe('Skip to content');
    const main = root.querySelector('main')!;
    let focused = false;
    main.focus = () => (focused = true);
    skip.click();
    expect(focused).toBe(true);
    setKernLocale('de');
    await page.waitForChanges();
    expect(skip.textContent).toBe('Zum Inhalt springen');
  });
});
