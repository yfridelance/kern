import { Component, Host, Prop, h } from '@stencil/core';

/**
 * Key figure tile: label, large value with unit, optional change and a slot for a sparkline or meta text.
 * Group tiles in a grid (`repeat(auto-fit, minmax(180px, 1fr))`).
 *
 * @slot - Below the value: kern-sparkline or meta text
 */
@Component({
  tag: 'kern-stat',
  styleUrl: 'kern-stat.css',
  shadow: true,
})
export class KernStat {
  @Prop() label!: string;
  @Prop() value!: string | number;
  @Prop() unit?: string;
  /** Change shown with an arrow, e.g. "2" or "+12 %". */
  @Prop() delta?: string;
  /** Direction of `delta`. */
  @Prop() trend?: 'up' | 'down';
  /** When "more" is bad (errors, offline): up shows danger, down shows ok. */
  @Prop() invert = false;
  /** Text after the delta. */
  @Prop() meta?: string;

  render() {
    const good = this.trend === 'up' ? !this.invert : this.invert;
    return (
      <Host>
        <span class="label">{this.label}</span>
        <span class="value">
          {this.value}
          {this.unit && <span class="unit">{this.unit}</span>}
        </span>
        {(this.delta || this.meta) && (
          <span class="meta">
            {this.delta && this.trend && (
              <span class={{ delta: true, good, bad: !good }}>
                <span aria-hidden="true">{this.trend === 'up' ? '▲' : '▼'}</span> {this.delta}
              </span>
            )}
            {this.meta}
          </span>
        )}
        <slot />
      </Host>
    );
  }
}
