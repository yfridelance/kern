import { Component, Host, Prop, h } from '@stencil/core';
import { meterLevel } from '../../utils/signal';

/**
 * Fill level with thresholds (RAM, flash, temperature, load). Colour goes ok → warn → danger;
 * `neutral` uses the accent for amounts without good/bad.
 */
@Component({
  tag: 'kern-meter',
  styleUrl: 'kern-meter.css',
  shadow: true,
})
export class KernMeter {
  @Prop() value = 0;
  @Prop() max = 100;
  @Prop() label?: string;
  /** `%` shows the share of max; any other unit shows the raw value. */
  @Prop() unit = '%';
  /** Threshold in percent of max. */
  @Prop() warn = 75;
  /** Threshold in percent of max. */
  @Prop() danger = 90;
  @Prop() neutral = false;

  render() {
    const value = Number(this.value) || 0;
    const pct = Math.max(0, Math.min(100, (value / (this.max || 1)) * 100));
    const level = this.neutral ? 'neutral' : meterLevel(pct, this.warn, this.danger);
    const shown = this.unit === '%' ? `${Math.round(pct)} %` : `${value} ${this.unit}`;
    return (
      <Host role="meter" aria-label={this.label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={this.max} aria-valuetext={shown} data-level={level}>
        <div class="head">
          <span>{this.label}</span>
          <span class="value">{shown}</span>
        </div>
        <div class="track">
          <div class="fill" style={{ width: `${pct}%` }} />
        </div>
      </Host>
    );
  }
}
