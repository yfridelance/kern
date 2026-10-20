import { Component, Host, Prop, h } from '@stencil/core';
import { parseNumbers, sparklinePoints } from '../../utils/signal';
import { kernTexts } from '../../utils/i18n';

const W = 100;
const H = 32;

/** Mini trend line without axes for tiles and table cells. Fills the container width; 32px high. */
@Component({
  tag: 'kern-sparkline',
  styleUrl: 'kern-sparkline.css',
  shadow: true,
})
export class KernSparkline {
  /** Numbers as array, JSON array or comma-separated string. */
  @Prop() values: number[] | string = [];
  @Prop() min?: number;
  @Prop() max?: number;
  /** Light area under the line. */
  @Prop() fill = false;
  @Prop({ reflect: true }) tone: 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'ok' | 'warn' | 'danger' = 'chart-1';
  @Prop() label?: string;
  private t = kernTexts(this, 'kern-sparkline');

  render() {
    const pts = sparklinePoints(parseNumbers(this.values), W, H, this.min, this.max);
    return (
      <Host role="img" aria-label={this.t('label')}>
        {pts && (
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            {this.fill && <polygon points={`0,${H} ${pts} ${W},${H}`} fill="currentColor" fill-opacity="0.14" stroke="none" />}
            <polyline points={pts} fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
          </svg>
        )}
      </Host>
    );
  }
}
