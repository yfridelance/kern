import { Component, Host, Prop, h } from '@stencil/core';
import { rssiLevel } from '../../utils/signal';

/**
 * WLAN signal strength: four bars plus dBm. ≥ −55: 4 · ≥ −67: 3 · ≥ −75: 2 · ≥ −85: 1 (warn) · below: 0 (danger).
 */
@Component({
  tag: 'kern-signal',
  styleUrl: 'kern-signal.css',
  shadow: true,
})
export class KernSignal {
  /** RSSI in dBm (Gen2+ `wifi.rssi`, Gen1 `wifi_sta.rssi`). */
  @Prop() rssi?: number;
  /** Hide the dBm number (narrow table columns). */
  @Prop() hideValue = false;
  @Prop() label = 'WLAN-Signal';

  render() {
    const rssi = this.rssi === undefined || this.rssi === null ? NaN : Number(this.rssi);
    const level = rssiLevel(rssi);
    const text = `${this.label} ${level}/4${Number.isNaN(rssi) ? '' : `, ${rssi} dBm`}`;
    return (
      <Host role="img" aria-label={text} data-level={level}>
        <span class="bars" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <i class={{ on: i <= level }} />
          ))}
        </span>
        {!this.hideValue && !Number.isNaN(rssi) && <span aria-hidden="true">{rssi} dBm</span>}
      </Host>
    );
  }
}
