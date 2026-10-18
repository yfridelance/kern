import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';

interface TabInfo {
  name: string;
  label: string;
  count?: string;
  panel: HTMLElement & { active?: boolean };
}

/**
 * Switches between views of the same object (Config / Status / Snapshots). Tabs are built from the
 * kern-tab-panel children; arrow keys, Home and End move between them.
 *
 * @slot - kern-tab-panel elements
 * @part tablist - The tab row
 * @part tab - Each tab button
 */
@Component({
  tag: 'kern-tabs',
  styleUrl: 'kern-tabs.css',
  shadow: true,
})
export class KernTabs {
  @Element() el!: HTMLElement;

  /** `name` of the selected panel; defaults to the first. */
  @Prop({ mutable: true, reflect: true }) value?: string;
  /** Accessible name of the tab list. */
  @Prop() label?: string;

  @Event() kernTabChange!: EventEmitter<{ value: string }>;

  @State() tabs: TabInfo[] = [];

  private buttons: HTMLButtonElement[] = [];
  private observer?: MutationObserver;

  connectedCallback() {
    this.read();
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    this.observer = new MutationObserver(() => this.read());
    this.observer.observe(this.el, { childList: true, attributes: true, subtree: false, attributeFilter: ['label', 'name', 'count'] });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  private read() {
    const panels = Array.from(Array.from(this.el.children).filter((c) => c.tagName.toLowerCase() === 'kern-tab-panel')) as TabInfo['panel'][];
    this.tabs = panels.map((p, i) => ({
      name: p.getAttribute('name') ?? String(i),
      label: p.getAttribute('label') ?? `Tab ${i + 1}`,
      count: p.getAttribute('count') ?? undefined,
      panel: p,
    }));
    if (!this.value || !this.tabs.some((t) => t.name === this.value)) this.value = this.tabs[0]?.name;
    this.apply();
  }

  @Watch('value')
  apply() {
    for (const t of this.tabs) t.panel.active = t.name === this.value;
  }

  private select(t: TabInfo, focus = false) {
    if (t.name !== this.value) {
      this.value = t.name;
      this.kernTabChange.emit({ value: t.name });
    }
    if (focus) this.buttons[this.tabs.indexOf(t)]?.focus();
  }

  private onKey = (ev: KeyboardEvent) => {
    const i = this.tabs.findIndex((t) => t.name === this.value);
    const n = this.tabs.length;
    const j = ev.key === 'ArrowRight' ? (i + 1) % n : ev.key === 'ArrowLeft' ? (i - 1 + n) % n : ev.key === 'Home' ? 0 : ev.key === 'End' ? n - 1 : -1;
    if (j >= 0) {
      ev.preventDefault();
      this.select(this.tabs[j], true);
    }
  };

  render() {
    this.buttons = [];
    return (
      <Host>
        <div class="tablist" role="tablist" part="tablist" aria-label={this.label} onKeyDown={this.onKey}>
          {this.tabs.map((t, i) => {
            const selected = t.name === this.value;
            return (
              <button
                ref={(el) => el && (this.buttons[i] = el)}
                type="button"
                role="tab"
                part="tab"
                aria-selected={selected ? 'true' : 'false'}
                tabIndex={selected ? 0 : -1}
                onClick={() => this.select(t)}
              >
                {t.label}
                {t.count && <kern-badge>{t.count}</kern-badge>}
              </button>
            );
          })}
        </div>
        <slot />
      </Host>
    );
  }
}
