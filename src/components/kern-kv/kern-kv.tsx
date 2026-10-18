import { Component, Host, h } from '@stencil/core';

/**
 * Key/value list for device information: kern-kv-item children, labels in a narrow column on the left.
 *
 * @slot - kern-kv-item elements
 */
@Component({
  tag: 'kern-kv',
  styleUrl: 'kern-kv.css',
  shadow: true,
})
export class KernKv {
  render() {
    return (
      <Host role="list">
        <slot />
      </Host>
    );
  }
}
