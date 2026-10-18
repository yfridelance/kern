import { Component, Host, Prop, h } from '@stencil/core';

/**
 * Short label for properties (Gen, firmware, function) and results in tables. At most two words;
 * device states use kern-status instead.
 *
 * @slot - Badge text
 */
@Component({
  tag: 'kern-badge',
  styleUrl: 'kern-badge.css',
  shadow: true,
})
export class KernBadge {
  @Prop({ reflect: true }) tone: 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' = 'neutral';
  /** Monospace text for versions and IDs. */
  @Prop({ reflect: true }) mono = false;

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
