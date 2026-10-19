import { Component, Host, Prop, h } from '@stencil/core';
import { durationToIso, formatDuration, formatTime, parseDateTime, parseDuration, parseTime } from '../../utils/datetime';

/**
 * Time of day („06:30“) or duration („1 Std., 23 Min.“) as `<time>`. Set either `value` or `duration`.
 * Invalid values are shown as given.
 */
@Component({
  tag: 'kern-time',
  styleUrl: 'kern-time.css',
  shadow: true,
})
export class KernTime {
  /** Time of day `HH:mm[:ss]`, or an ISO 8601 point in time / epoch milliseconds / Date whose time is shown. */
  @Prop() value?: string | number | Date;
  /** ISO 8601 duration (`PT1H23M`) or seconds (`5025`, e.g. uptime). Takes precedence over `value`. */
  @Prop() duration?: string | number;
  /** Show seconds of a time of day. */
  @Prop() seconds = false;
  /** 12-hour clock; defaults to the locale. */
  @Prop() hour12?: boolean;
  /** BCP 47 locale; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  /** IANA time zone for points in time; defaults to the browser's. */
  @Prop() timeZone?: string;
  /** Monospace digits, e.g. in tables next to IDs. */
  @Prop({ reflect: true }) mono = false;

  private content(): { text: string; datetime?: string } {
    if (this.duration != null && this.duration !== '') {
      const d = parseDuration(this.duration);
      return d ? { text: formatDuration(d, this.locale), datetime: durationToIso(d) } : { text: String(this.duration) };
    }
    if (this.value == null || this.value === '') return { text: '' };
    const text = formatTime(this.value, { seconds: this.seconds, hour12: this.hour12, locale: this.locale, timeZone: this.timeZone });
    if (text === null) return { text: String(this.value) };
    const v = typeof this.value === 'string' && parseTime(this.value) !== null ? null : parseDateTime(this.value);
    return { text, datetime: v ? v.date.toISOString() : String(this.value).trim() };
  }

  render() {
    const { text, datetime } = this.content();
    return <Host>{datetime ? <time dateTime={datetime}>{text}</time> : text}</Host>;
  }
}
