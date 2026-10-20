import { Component, Host, Prop, h } from '@stencil/core';

/**
 * An item of a `kern-grid` with `columns` that spans several columns. `span-sm`, `span-md` and `span-lg` change the
 * span from 640, 960 and 1280 px grid width, e.g. `span="12" span-md="8"`: full width on small grids, two thirds
 * from 960 px. A span larger than the columns is cut to the row.
 *
 * @slot - Content
 */
@Component({
  tag: 'kern-grid-item',
  styleUrl: 'kern-grid-item.css',
  shadow: true,
})
export class KernGridItem {
  /** Columns spanned. */
  @Prop() span = 1;
  /** Columns spanned from 640 px grid width. */
  @Prop() spanSm?: number;
  /** Columns spanned from 960 px grid width. */
  @Prop() spanMd?: number;
  /** Columns spanned from 1280 px grid width. */
  @Prop() spanLg?: number;

  render() {
    // Unset values are `initial`, so an item inside another item never inherits the outer one's spans.
    const v = (n?: number) => (n ? String(n) : 'initial');
    const vars = { '--_s': String(this.span || 1), '--_s-sm': v(this.spanSm), '--_s-md': v(this.spanMd), '--_s-lg': v(this.spanLg) };
    return (
      <Host style={vars}>
        <slot />
      </Host>
    );
  }
}
