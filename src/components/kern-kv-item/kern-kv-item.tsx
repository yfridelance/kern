import { Component, Host, Prop, h } from '@stencil/core';

/**
 * One row of kern-kv. Technical values in `mono`; copyable ones as kern-copy. Unknown: "–", never empty.
 *
 * @slot - The value
 */
@Component({
  tag: 'kern-kv-item',
  styleUrl: 'kern-kv-item.css',
  shadow: true,
})
export class KernKvItem {
  @Prop() label!: string;
  @Prop({ reflect: true }) mono = false;

  render() {
    return (
      <Host role="listitem">
        <span class="label">{this.label}</span>
        <span class="value">
          <slot />
        </span>
      </Host>
    );
  }
}
