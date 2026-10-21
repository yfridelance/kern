import { Component, Element, Host, Method, Prop, Watch, h } from '@stencil/core';

/**
 * Collapsible JSON tree for configs, status and device info (native `<details>`, keyboard accessible).
 * Closed nodes show their size ({4}, [2]).
 */
@Component({
  tag: 'kern-json',
  styleUrl: 'kern-json.css',
  shadow: true,
})
export class KernJson {
  /** The value to show (object, array or primitive). A string is parsed as JSON when possible. */
  @Prop() data?: unknown;
  @Element() el!: HTMLElement;

  /** Nodes up to this depth start open. Changing it opens or closes every node to that depth, including nodes toggled by hand. */
  @Prop({ mutable: true }) openDepth = 1;

  private applyPending = false;

  @Watch('openDepth')
  onOpenDepth() {
    this.applyPending = true;
  }

  componentDidRender() {
    if (!this.applyPending) return;
    this.applyPending = false;
    this.applyOpenDepth();
  }

  /** Sets `open` on every node directly; the VDOM only knows the value of the last render, not clicks by hand. */
  private applyOpenDepth() {
    this.el.shadowRoot?.querySelectorAll('details').forEach((d) => {
      if (Number(d.getAttribute('data-depth')) < this.openDepth) d.setAttribute('open', '');
      else d.removeAttribute('open');
    });
  }

  /** Opens nodes up to `depth` and closes all others; also resets nodes toggled by hand when `depth` is unchanged. */
  @Method()
  async setOpenDepth(depth: number) {
    const same = depth === this.openDepth;
    this.openDepth = depth;
    if (same) this.applyOpenDepth();
  }

  /** Opens every node. */
  @Method()
  async expandAll() {
    await this.setOpenDepth(Infinity);
  }

  /** Closes every node. */
  @Method()
  async collapseAll() {
    await this.setOpenDepth(0);
  }

  private value(): unknown {
    if (typeof this.data !== 'string') return this.data;
    try {
      return JSON.parse(this.data);
    } catch {
      return this.data;
    }
  }

  private leaf(v: unknown) {
    if (v === null || typeof v === 'boolean') return <span class="literal">{String(v)}</span>;
    if (typeof v === 'number') return <span class="number">{v}</span>;
    return <span class="string">"{String(v)}"</span>;
  }

  private node(key: string | null, v: unknown, depth: number): any {
    const k = key === null ? null : [<span class="key">{key}</span>, ': '];
    if (v === null || typeof v !== 'object') {
      return (
        <div class="leaf">
          {k}
          {this.leaf(v)}
        </div>
      );
    }
    const isArr = Array.isArray(v);
    const entries = Object.entries(v as Record<string, unknown>);
    return (
      <details open={depth < this.openDepth} data-depth={depth}>
        <summary>
          {k}
          <span class="meta">{isArr ? `[${entries.length}]` : `{${entries.length}}`}</span>
        </summary>
        <div class="children">{entries.map(([kk, vv]) => this.node(kk, vv, depth + 1))}</div>
      </details>
    );
  }

  render() {
    const v = this.value();
    if (v === undefined) return <Host />;
    const top = v !== null && typeof v === 'object' ? Object.entries(v as Record<string, unknown>).map(([k, vv]) => this.node(k, vv, 0)) : this.node(null, v, 0);
    return <Host>{top}</Host>;
  }
}
