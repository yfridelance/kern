import { Component, Element, Host, Prop, State, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';

/**
 * Path back through a hierarchy (Standort › Raum › Gerät › Einstellungen): child links (kern-link or `<a>`), the last
 * child is the current page (`aria-current="page"`). With `max-items` the middle entries collapse into a „…“ menu;
 * picking one clicks the original link, so app routers still handle it.
 *
 * @slot - Links; the last one (or a plain text element) is the current page
 */
@Component({
  tag: 'kern-breadcrumb',
  styleUrl: 'kern-breadcrumb.css',
  shadow: true,
})
export class KernBreadcrumb {
  @Element() el!: HTMLElement;

  /** Accessible name of the navigation. */
  @Prop() label = 'Pfad';
  /** Show at most this many entries (first, „…“ and the last ones); 0 shows all. */
  @Prop() maxItems = 0;
  @Prop() labelMore = 'Weitere Ebenen';

  @State() count = 0;

  private observer?: MutationObserver;

  private get items(): HTMLElement[] {
    return Array.from(this.el.children).filter((c) => c.localName !== 'template') as HTMLElement[];
  }

  connectedCallback() {
    this.assign();
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    this.observer = new MutationObserver(() => this.assign());
    this.observer.observe(this.el, { childList: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  /** One named slot per child, so separators can sit between them; the last child marks the current page. */
  @Watch('maxItems')
  assign() {
    const items = this.items;
    items.forEach((it, i) => {
      const slot = `item-${i}`;
      if (it.getAttribute('slot') !== slot) it.setAttribute('slot', slot);
      if (i === items.length - 1) it.setAttribute('aria-current', 'page');
      else if (it.getAttribute('aria-current') === 'page') it.removeAttribute('aria-current');
    });
    this.count = items.length;
  }

  /** Indices of entries folded into „…“. */
  private get collapsed(): number[] {
    const n = this.count;
    const max = this.maxItems;
    if (!max || max < 3 || n <= max) return [];
    // Keep the first and the last (max - 2) entries.
    return Array.from({ length: n - max + 1 }, (_, i) => i + 1);
  }

  private onMore = (ev: CustomEvent<{ value: string }>) => {
    ev.stopPropagation();
    const target = this.items[Number(ev.detail.value)];
    const link = (target?.shadowRoot?.querySelector('a') ?? target) as HTMLElement | undefined;
    link?.click();
  };

  render() {
    const hidden = new Set(this.collapsed);
    const items = this.items;
    // A function: Stencil must not reuse the same JSX node in two places.
    const sep = () => (
      <span class="sep" aria-hidden="true">
        <Icon name="chevron-right" />
      </span>
    );
    const lis: unknown[] = [];
    for (let i = 0; i < this.count; i++) {
      if (hidden.has(i)) {
        if (i === Math.min(...hidden)) {
          lis.push(
            <li class="more">
              {sep()}
              <kern-menu label={this.labelMore} onKernSelect={this.onMore}>
                <button slot="trigger" type="button" class="more-button" aria-label={this.labelMore} title={this.labelMore}>
                  …
                </button>
                {[...hidden].map((idx) => (
                  <kern-menu-item value={String(idx)}>{items[idx]?.textContent?.trim()}</kern-menu-item>
                ))}
              </kern-menu>
            </li>,
          );
        }
        // Keep the slot so the hidden child stays assigned but invisible.
        lis.push(
          <li hidden>
            <slot name={`item-${i}`} />
          </li>,
        );
        continue;
      }
      lis.push(
        <li class={{ current: i === this.count - 1 }}>
          {i > 0 && sep()}
          <slot name={`item-${i}`} />
        </li>,
      );
    }
    return (
      <Host>
        <nav aria-label={this.label}>
          <ol>{lis}</ol>
        </nav>
      </Host>
    );
  }
}
