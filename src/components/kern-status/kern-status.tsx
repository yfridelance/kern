import { Component, Host, Prop, h } from '@stencil/core';

/**
 * State of a device, job or server: a dot whose shape and colour differ per tone, plus the word.
 * ok = circle, warn = diamond, danger = square, busy = pulsing circle, neutral = hollow circle.
 *
 * @slot - The state as a word (always required)
 * @part dot - The indicator
 */
@Component({
  tag: 'kern-status',
  styleUrl: 'kern-status.css',
  shadow: true,
})
export class KernStatus {
  @Prop({ reflect: true }) tone: 'neutral' | 'ok' | 'warn' | 'danger' | 'busy' = 'neutral';

  render() {
    return (
      <Host>
        <span class="dot" part="dot" aria-hidden="true" />
        <slot />
      </Host>
    );
  }
}
