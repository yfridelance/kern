import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { formatDate, formatRelative, onTick, parseDateTime, relativeRefresh, toIso, type KernDateFormat } from '../../utils/datetime';

/**
 * Formatted date or point in time („19.10.2026, 10:15“) or relative („vor 3 Min.“, „gestern“) as `<time>`.
 * Relative texts update themselves; the absolute value with time is shown as tooltip. Invalid values are shown as given.
 */
@Component({
  tag: 'kern-date',
  styleUrl: 'kern-date.css',
  shadow: true,
})
export class KernDate {
  /** ISO date (`2026-10-19`), ISO 8601 point in time, epoch milliseconds or a Date. */
  @Prop() value?: string | number | Date;
  /** Length of the date (`Intl.DateTimeFormat` dateStyle). */
  @Prop() format: KernDateFormat = 'medium';
  /** Also show the time (not for calendar dates). */
  @Prop() time = false;
  /** Relative to now, e.g. „vor 3 Min.“. */
  @Prop() relative = false;
  /** BCP 47 locale; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  /** IANA time zone, e.g. `Europe/Zurich`; defaults to the browser's. */
  @Prop() timeZone?: string;

  @State() now = Date.now();

  private nextUpdate = 0;
  private unsubscribe?: () => void;

  connectedCallback() {
    this.syncTicker();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  @Watch('relative')
  @Watch('value')
  syncTicker() {
    this.now = Date.now();
    if (!this.relative) this.disconnectedCallback();
    else this.unsubscribe ??= onTick(this.tick);
  }

  private tick = () => {
    const t = Date.now();
    if (t >= this.nextUpdate) this.now = t;
  };

  render() {
    const v = parseDateTime(this.value);
    if (!v) return <Host>{this.value == null ? '' : String(this.value)}</Host>;
    // The tooltip of a relative text always carries the time; „vor 3 Min.“ → „19.10.2026, 10:15“.
    const absolute = formatDate(v, { format: this.format, time: this.time || this.relative, locale: this.locale, timeZone: this.timeZone });
    let text = absolute;
    if (this.relative) {
      text = formatRelative(v, this.now, this.locale);
      this.nextUpdate = this.now + relativeRefresh(v, this.now);
    }
    return (
      <Host>
        <time dateTime={toIso(v)} title={this.relative ? absolute : undefined}>
          {text}
        </time>
      </Host>
    );
  }
}
