import { Component, Host, Prop, h } from '@stencil/core';

/**
 * Progress of a long operation. With `value` it shows the share of `max` (scan, template on N devices);
 * without `value` it runs as an indeterminate band (firmware update, reboot).
 *
 * @part bar - The filled part
 */
@Component({
  tag: 'kern-progress',
  styleUrl: 'kern-progress.css',
  shadow: true,
})
export class KernProgress {
  @Prop() value?: number;
  @Prop() max = 100;
  /** Text on the left above the bar. */
  @Prop() label?: string;
  /** Text on the right above the bar, e.g. "148 / 254". */
  @Prop() valueText?: string;

  render() {
    const determinate = this.value !== undefined && this.value !== null && !Number.isNaN(Number(this.value));
    const pct = determinate ? Math.max(0, Math.min(100, (Number(this.value) / (this.max || 1)) * 100)) : 0;
    return (
      <Host>
        {(this.label || this.valueText) && (
          <div class="head">
            <span>{this.label}</span>
            {this.valueText && <strong>{this.valueText}</strong>}
          </div>
        )}
        <div
          class={{ track: true, indeterminate: !determinate }}
          role="progressbar"
          aria-label={this.label}
          aria-valuemin={determinate ? 0 : undefined}
          aria-valuemax={determinate ? this.max : undefined}
          aria-valuenow={determinate ? Number(this.value) : undefined}
          aria-valuetext={this.valueText}
        >
          <div class="bar" part="bar" style={determinate ? { width: `${pct}%` } : {}} />
        </div>
      </Host>
    );
  }
}
