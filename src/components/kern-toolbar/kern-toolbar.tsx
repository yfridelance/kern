import { Component, Host, h } from '@stencil/core';

/**
 * Row above a table: search, filters, then (right-aligned) result count and actions.
 *
 * @slot - Search and filters, left
 * @slot end - Count and actions, right
 */
@Component({
  tag: 'kern-toolbar',
  styleUrl: 'kern-toolbar.css',
  shadow: true,
})
export class KernToolbar {
  render() {
    return (
      <Host role="toolbar">
        <slot />
        <span class="spacer" />
        <slot name="end" />
      </Host>
    );
  }
}
