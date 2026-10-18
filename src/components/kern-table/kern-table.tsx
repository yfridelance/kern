import { Component, Prop } from '@stencil/core';

/**
 * Dense data table: wraps a native `<table>` (light DOM, so cells can hold any markup and Angular bindings).
 * Sortable column: `<th aria-sort="ascending|descending"><button>…</button></th>`.
 * Cells: `class="mono"` (IP, MAC, IDs), `class="num"` (right-aligned figures).
 * Rows: `class="clickable"`, `aria-selected="true"`, `class="dim"` (reset/inactive).
 * Empty state: `<td colspan="…" class="empty">`.
 *
 * @slot - A native `<table>`
 */
@Component({
  tag: 'kern-table',
  styleUrl: 'kern-table.css',
  // No encapsulation on purpose: the slotted table's th/td must be styleable.
  shadow: false,
  scoped: false,
})
export class KernTable {
  /** 30px rows instead of 36px. */
  @Prop({ reflect: true }) compact = false;
  // No render(): the light-DOM table stays exactly as the app renders it.
}
