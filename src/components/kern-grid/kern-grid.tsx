import { Component, Host, Prop, h } from '@stencil/core';

/**
 * Lays out cards, tiles and form groups in columns. Without `columns` it fits as many columns of at least `min` as
 * there is room for, without breakpoints. With `columns` it has a fixed number of equal columns; `columns-sm`,
 * `columns-md` and `columns-lg` change it from 640, 960 and 1280 px, and `kern-grid-item` children span several.
 *
 * Breakpoints are measured on the grid itself (container queries), not on the window, so a grid in a sidebar, a
 * drawer or half a page switches by the room it really has.
 *
 * @slot - The items: any elements, or `kern-grid-item` to span columns
 * @part grid - The grid
 */
@Component({
  tag: 'kern-grid',
  styleUrl: 'kern-grid.css',
  shadow: true,
})
export class KernGrid {
  /** Smallest column width in auto mode (without `columns`), e.g. `240px` or `16rem`. */
  @Prop() min = '240px';
  /** Auto mode: stretch few items over the whole width instead of keeping empty columns. */
  @Prop() fit = false;
  /** Fixed number of columns; switches from auto mode to columns. */
  @Prop() columns?: number;
  /** Columns from 640 px grid width. */
  @Prop() columnsSm?: number;
  /** Columns from 960 px grid width. */
  @Prop() columnsMd?: number;
  /** Columns from 1280 px grid width. */
  @Prop() columnsLg?: number;
  /** Space between items: `sm` 12 px, `md` 16 px, `lg` 24 px. */
  @Prop({ reflect: true }) gap: 'sm' | 'md' | 'lg' = 'md';
  /** `stretch` makes items in a row equally high (cards); `start` keeps their own height. */
  @Prop({ reflect: true }) align: 'stretch' | 'start' = 'stretch';

  render() {
    const cols = this.columns !== undefined;
    // Unset values are `initial`, so a grid inside another one never inherits the outer one's columns (in auto mode
    // `--_cols` too; in column mode the stylesheet sets it per breakpoint).
    const v = (n?: number) => (n ? String(n) : 'initial');
    const vars = cols
      ? { '--_c': v(this.columns), '--_c-sm': v(this.columnsSm), '--_c-md': v(this.columnsMd), '--_c-lg': v(this.columnsLg) }
      : { '--_min': this.min, '--_cols': 'initial' };
    return (
      <Host>
        <div class={{ grid: true, cols, auto: !cols, fit: this.fit }} part="grid" style={vars}>
          <slot />
        </div>
      </Host>
    );
  }
}
