import { Component, Element, Event, EventEmitter, Host, Listen, Method, Prop, State, Watch, h } from '@stencil/core';
import { kernTexts } from '../../utils/i18n';

/** Clicks on these in the sidebar navigate, so the drawer closes. */
const LINKS = 'a[href], kern-link[href], kern-list-item[href], kern-button[href]';

/**
 * Base layout of an app: topbar, optional side navigation, main content with a maximum width and page padding, and
 * an optional footer. Without the `sidebar` slot it is a plain page frame.
 *
 * From `breakpoint` (960 px of shell width) the sidebar stands on the left and scrolls on its own; below it, it opens
 * as a modal drawer from the left. A kern-topbar in the `topbar` slot then gets a menu button (`menu`) that opens it;
 * with your own header call `toggleSidebar()`. A link click in the drawer closes it and moves focus to the main
 * content; after routing in `kernNavigate` call `focusMain()` for the same in the wide layout. A skip link («Skip to
 * content») leads past the navigation, and `<header>`, `<nav>` and `<main>` are landmarks (the navigation also
 * inside the drawer).
 *
 * @slot - Main content (kern-page-header, kern-grid …)
 * @slot topbar - kern-topbar (or your own header); stays at the top while scrolling
 * @slot sidebar - Side navigation, e.g. a kern-list with links
 * @slot footer - Below the content
 * @part sidebar - The side navigation column (wide layout)
 * @part main - The main area
 * @part footer - The footer
 */
@Component({
  tag: 'kern-app-shell',
  styleUrl: 'kern-app-shell.css',
  shadow: true,
})
export class KernAppShell {
  @Element() el!: HTMLElement;

  /** Maximum content width: `normal` (`--content-max`), `wide` (`--content-wide`) or `full`. */
  @Prop({ reflect: true }) width: 'normal' | 'wide' | 'full' = 'normal';
  /** Width of the side navigation in px. */
  @Prop() sidebarWidth = 240;
  /** Shell width in px from which the sidebar stands next to the content; below, it is a drawer. */
  @Prop() breakpoint = 960;
  /** Whether the drawer with the side navigation is open (narrow layout only). */
  @Prop({ mutable: true, reflect: true }) sidebarOpen = false;
  /** Text of the skip link. */
  @Prop() labelSkip?: string;
  /** Accessible name of the side navigation and title of the drawer. */
  @Prop() labelNavigation?: string;
  private t = kernTexts(this, 'kern-app-shell');

  /** The drawer with the side navigation opened or closed. */
  @Event() kernSidebarToggle!: EventEmitter<{ open: boolean }>;

  @State() wide = true;
  @State() hasSidebar = false;
  @State() hasTopbar = false;
  @State() hasFooter = false;

  private main?: HTMLElement;
  /** Focus the main content once the drawer has closed (the dialog returns focus to the menu button first). */
  private focusOnClose = false;
  private observer?: MutationObserver;
  private resize?: ResizeObserver;
  /** Last measured shell width, to re-check a changed `breakpoint`. */
  private measured = 0;

  connectedCallback() {
    this.readChildren();
    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => this.readChildren());
      this.observer.observe(this.el, { childList: true, attributes: true, attributeFilter: ['slot'] });
    }
    if (typeof ResizeObserver !== 'undefined') {
      this.resize = new ResizeObserver(([entry]) => this.measure(entry.contentRect.width));
      this.resize.observe(this.el);
    }
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.resize?.disconnect();
  }

  componentDidLoad() {
    // First layout without waiting for the observer (it only reports on rendered frames).
    const width = this.el.getBoundingClientRect().width;
    if (width) this.measure(width);
  }

  componentDidRender() {
    this.syncTopbar();
  }

  private readChildren() {
    const slots = Array.from(this.el.children).map((c) => c.getAttribute('slot'));
    this.hasSidebar = slots.includes('sidebar');
    this.hasTopbar = slots.includes('topbar');
    this.hasFooter = slots.includes('footer');
  }

  private measure(width: number) {
    this.measured = width;
    const wide = width >= this.breakpoint;
    if (wide && this.sidebarOpen) this.toggleSidebar(false);
    this.wide = wide;
  }

  @Watch('breakpoint')
  onBreakpoint() {
    if (this.measured) this.measure(this.measured);
  }

  /** A kern-topbar in the topbar slot shows the menu button while the sidebar is a drawer. */
  private syncTopbar() {
    const bar = Array.from(this.el.children).find((c) => c.localName === 'kern-topbar' && c.getAttribute('slot') === 'topbar') as
      | (HTMLElement & { menu: boolean; menuExpanded: boolean })
      | undefined;
    if (!bar) return;
    const menu = this.hasSidebar && !this.wide;
    if (bar.menu !== menu) bar.menu = menu;
    if (bar.menuExpanded !== this.sidebarOpen) bar.menuExpanded = this.sidebarOpen;
  }

  /** Opens or closes the drawer with the side navigation (narrow layout); without an argument it toggles. */
  @Method()
  async toggleSidebar(open = !this.sidebarOpen) {
    if (open && (this.wide || !this.hasSidebar)) return;
    if (open === this.sidebarOpen) return;
    this.sidebarOpen = open;
    this.kernSidebarToggle.emit({ open });
  }

  /**
   * Moves focus to the main content, e.g. after a navigation without page load, so keyboard and screen reader users
   * continue there. While the drawer is open (everything else is inert) it waits until the drawer has closed.
   */
  @Method()
  async focusMain() {
    if (this.sidebarOpen) this.focusOnClose = true;
    else this.main?.focus();
  }

  @Listen('kernMenu')
  onMenu(ev: CustomEvent<{ expanded: boolean }>) {
    if ((ev.target as Element).getAttribute('slot') !== 'topbar') return;
    this.toggleSidebar(ev.detail.expanded);
  }

  private onDrawerClose = (ev: Event) => {
    ev.stopPropagation(); // the shell's own drawer; the app hears kernSidebarToggle
    this.toggleSidebar(false);
    if (this.focusOnClose) this.main?.focus();
    this.focusOnClose = false;
  };

  /** A link click navigates: close the drawer and continue in the content, not at the menu button. */
  private onDrawerClick = (ev: MouseEvent) => {
    if (!ev.composedPath().some((n) => (n as HTMLElement).matches?.(LINKS))) return;
    this.focusOnClose = true;
    this.toggleSidebar(false);
  };

  private onSkip = (ev: MouseEvent) => {
    ev.preventDefault();
    this.main?.focus();
  };

  render() {
    const sidebar = <slot name="sidebar" />;
    const inline = this.hasSidebar && this.wide;
    return (
      <Host style={{ '--_sidebar': `${this.sidebarWidth}px` }}>
        <a class="skip" href="#" onClick={this.onSkip}>
          {this.t('labelSkip')}
        </a>
        <slot name="topbar" />
        <div class={{ body: true, 'with-sidebar': inline, 'no-topbar': !this.hasTopbar }}>
          {this.hasSidebar &&
            (inline ? (
              <nav class="sidebar" part="sidebar" aria-label={this.t('labelNavigation')}>
                {sidebar}
              </nav>
            ) : (
              <kern-drawer
                side="start"
                heading={this.t('labelNavigation')}
                width={Math.max(this.sidebarWidth, 280)}
                open={this.sidebarOpen}
                onKernClose={this.onDrawerClose}
                onClick={this.onDrawerClick}
              >
                <nav aria-label={this.t('labelNavigation')}>{sidebar}</nav>
              </kern-drawer>
            ))}
          <main ref={(el) => (this.main = el)} tabindex={-1} part="main">
            <div class="content">
              <slot />
            </div>
          </main>
        </div>
        <footer part="footer" hidden={!this.hasFooter}>
          <div class="content">
            <slot name="footer" />
          </div>
        </footer>
      </Host>
    );
  }
}
