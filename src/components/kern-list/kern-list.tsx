import { Component, Element, Host, Prop, State, h } from '@stencil/core';

/**
 * List of rows (devices, settings, events): kern-list-item children, separated by lines, in a bordered box.
 * `flush` drops the box, e.g. inside kern-card. Shows `empty` when there are no items.
 *
 * @slot - kern-list-item elements
 * @part list - The list box
 * @part empty - The text shown without items
 */
@Component({
  tag: 'kern-list',
  styleUrl: 'kern-list.css',
  shadow: true,
})
export class KernList {
  @Element() el!: HTMLElement;

  /** Without border and background, e.g. inside kern-card. */
  @Prop({ reflect: true }) flush = false;
  /** `sm` = denser rows. */
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  /** Shown when there are no items; empty string shows nothing. */
  @Prop() empty = 'Keine Einträge';
  /** Accessible name of the list. */
  @Prop() label?: string;

  @State() count = 0;

  componentWillLoad() {
    this.count = this.el.children.length;
  }

  render() {
    return (
      <Host>
        <div class="list" part="list" role="list" aria-label={this.label} hidden={!this.count}>
          <slot onSlotchange={(e) => (this.count = (e.target as HTMLSlotElement).assignedElements().length)} />
        </div>
        {!this.count && this.empty && (
          <div class="empty" part="empty">
            {this.empty}
          </div>
        )}
      </Host>
    );
  }
}
