import { Component, Element, Host, Prop, State, h } from '@stencil/core';

/**
 * Surface for one block of related content. Border, no shadow; no cards inside cards.
 *
 * @slot - Body
 * @slot meta - Next to the heading (badge, subtitle)
 * @slot actions - Small buttons on the right of the header
 * @slot footer - Form actions, right-aligned
 * @part header - Header row
 * @part body - Body
 */
@Component({
  tag: 'kern-card',
  styleUrl: 'kern-card.css',
  shadow: true,
})
export class KernCard {
  @Element() el!: HTMLElement;

  @Prop() heading?: string;
  /** Heading level for the document outline. */
  @Prop() headingLevel: 2 | 3 | 4 = 2;
  /** Body without padding (tables, lists up to the edge). */
  @Prop({ reflect: true }) flush = false;

  @State() hasActions = false;
  @State() hasMeta = false;
  @State() hasFooter = false;

  componentWillLoad() {
    const has = (name: string) => Array.from(this.el.children).some((c) => c.getAttribute('slot') === name);
    this.hasActions = has('actions');
    this.hasMeta = has('meta');
    this.hasFooter = has('footer');
  }

  private watch = (key: 'hasActions' | 'hasMeta' | 'hasFooter') => (e: Event) => {
    this[key] = (e.target as HTMLSlotElement).assignedElements().length > 0;
  };

  render() {
    const H = `h${this.headingLevel}`;
    const showHeader = !!this.heading || this.hasActions || this.hasMeta;
    return (
      <Host>
        <header part="header" hidden={!showHeader}>
          {this.heading && h(H, { class: { heading: true } }, this.heading)}
          <slot name="meta" onSlotchange={this.watch('hasMeta')} />
          <div class="actions">
            <slot name="actions" onSlotchange={this.watch('hasActions')} />
          </div>
        </header>
        <div class="body" part="body">
          <slot />
        </div>
        <footer hidden={!this.hasFooter}>
          <slot name="footer" onSlotchange={this.watch('hasFooter')} />
        </footer>
      </Host>
    );
  }
}
