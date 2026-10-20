import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { resolveLocale } from '../../utils/datetime';
import { kernTexts } from '../../utils/i18n';

let nextId = 0;

type Thumb = 0 | 1;

/**
 * Slider for brightness, volume or thresholds, form-associated. One handle (`value` is a number) or two with `range`
 * (`value` is `"from/to"`, the handles cannot cross). Drag or click the track; keyboard: Arrow keys ± `step`,
 * Page Up/Down ± a tenth of the range, Home/End to the limits. `marks` adds labelled ticks.
 *
 * @part track - The track
 * @part thumb - Each handle
 */
@Component({
  tag: 'kern-range',
  styleUrl: 'kern-range.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernRange {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** A number, or `"from/to"` with `range`. */
  @Prop({ mutable: true }) value: number | string = 0;
  @Prop() name?: string;
  @Prop() min = 0;
  @Prop() max = 100;
  @Prop() step = 1;
  /** Two handles; `value` becomes `"from/to"`. */
  @Prop({ reflect: true }) range = false;
  /** Unit after the shown value, e.g. „%“. */
  @Prop() unit?: string;
  /** Show the current value next to the label. */
  @Prop() showValue = true;
  /** Ticks with labels, e.g. `0,25,50,75,100`. */
  @Prop() marks: number[] | string = '';
  /** BCP 47 locale for numbers; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  @Prop({ reflect: true }) disabled = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  @Prop() labelFrom?: string;
  @Prop() labelTo?: string;
  private t = kernTexts(this, 'kern-range');

  /** While dragging or on every key step. */
  @Event() kernInput!: EventEmitter<{ value: number | string }>;
  /** When a drag ends or a key changed the value. */
  @Event() kernChange!: EventEmitter<{ value: number | string }>;

  @State() dragging: Thumb | -1 = -1;

  private track?: HTMLElement;
  private thumbs: HTMLElement[] = [];
  private uid = `kern-range-${++nextId}`;
  private initial: number | string = 0;
  private startValue: number | string = 0;

  componentWillLoad() {
    this.initial = this.serialize(this.values);
  }

  componentDidLoad() {
    this.sync();
  }

  private get places(): number {
    const s = String(this.step);
    return (s.split('.')[1] ?? '').length;
  }

  /** Current handle positions, clamped and ordered. */
  private get values(): [number, number] {
    const clamp = (n: number) => this.snap(Number.isFinite(n) ? n : this.min);
    if (this.range) {
      const [a, b] = String(this.value ?? '').split('/').map(Number);
      const lo = clamp(Number.isFinite(a) ? a : this.min);
      const hi = clamp(Number.isFinite(b) ? b : this.max);
      return lo <= hi ? [lo, hi] : [hi, lo];
    }
    const v = clamp(Number(this.value));
    return [v, v];
  }

  private snap(n: number): number {
    const stepped = Math.round((n - this.min) / this.step) * this.step + this.min;
    return Number(Math.max(this.min, Math.min(this.max, stepped)).toFixed(this.places));
  }

  private serialize([a, b]: [number, number]): number | string {
    return this.range ? `${a}/${b}` : a;
  }

  @Watch('value')
  @Watch('error')
  sync() {
    const v = this.serialize(this.values);
    this.internals?.setFormValue?.(String(v));
    if (this.error) this.internals?.setValidity?.({ customError: true }, this.error, this.thumbs[0]);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Focuses the (first) handle. */
  @Method()
  async setFocus() {
    this.thumbs[0]?.focus();
  }

  private format(n: number): string {
    const s = new Intl.NumberFormat(resolveLocale(this.locale), { minimumFractionDigits: this.places, maximumFractionDigits: this.places }).format(n);
    return this.unit ? `${s} ${this.unit}` : s;
  }

  private pct(n: number): number {
    return this.max === this.min ? 0 : ((n - this.min) / (this.max - this.min)) * 100;
  }

  /** Move one handle; the other one limits it. Returns whether the value changed. */
  private set(thumb: Thumb, n: number): boolean {
    const [a, b] = this.values;
    let next: [number, number];
    if (!this.range) next = [this.snap(n), this.snap(n)];
    else if (thumb === 0) next = [Math.min(this.snap(n), b), b];
    else next = [a, Math.max(this.snap(n), a)];
    const v = this.serialize(next);
    if (v === this.serialize([a, b])) return false;
    this.value = v;
    this.kernInput.emit({ value: v });
    return true;
  }

  private fromPointer(ev: PointerEvent): number {
    const r = this.track!.getBoundingClientRect();
    const ratio = r.width ? Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) : 0;
    return this.min + ratio * (this.max - this.min);
  }

  private onTrackDown = (ev: PointerEvent) => {
    if (this.disabled || ev.button !== 0 || !this.track) return;
    ev.preventDefault();
    const n = this.fromPointer(ev);
    const [a, b] = this.values;
    // The nearer handle moves; on a tie the one in the direction of the click.
    const thumb: Thumb = !this.range ? 0 : Math.abs(n - a) < Math.abs(n - b) || (a === b && n < a) ? 0 : 1;
    this.startValue = this.serialize(this.values);
    this.dragging = thumb;
    this.set(thumb, n);
    this.thumbs[thumb]?.focus();
    this.track.setPointerCapture?.(ev.pointerId);
  };

  private onTrackMove = (ev: PointerEvent) => {
    if (this.dragging < 0) return;
    this.set(this.dragging as Thumb, this.fromPointer(ev));
  };

  private onTrackUp = (ev: PointerEvent) => {
    if (this.dragging < 0) return;
    this.dragging = -1;
    this.track?.releasePointerCapture?.(ev.pointerId);
    const v = this.serialize(this.values);
    if (v !== this.startValue) this.kernChange.emit({ value: v });
  };

  private onKey = (thumb: Thumb) => (ev: KeyboardEvent) => {
    if (this.disabled) return;
    const cur = this.values[thumb];
    const big = Math.max(this.step, (this.max - this.min) / 10);
    const keys: Record<string, number> = {
      ArrowRight: cur + this.step,
      ArrowUp: cur + this.step,
      ArrowLeft: cur - this.step,
      ArrowDown: cur - this.step,
      PageUp: cur + big,
      PageDown: cur - big,
      Home: this.min,
      End: this.max,
    };
    if (!(ev.key in keys)) return;
    ev.preventDefault();
    if (this.set(thumb, keys[ev.key])) this.kernChange.emit({ value: this.serialize(this.values) });
  };

  private get markList(): number[] {
    const m = this.marks;
    const list = Array.isArray(m) ? m : String(m ?? '').split(',').filter((s) => s.trim() !== '');
    return list.map(Number).filter((n) => Number.isFinite(n) && n >= this.min && n <= this.max);
  }

  render() {
    const [a, b] = this.values;
    const describedBy = this.error ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const labelId = this.label ? `${this.uid}-label` : undefined;
    const shown = this.range ? `${this.format(a)} – ${this.format(b)}` : this.format(a);
    const name = this.label ?? this.ariaLabelText;
    const thumbs: Thumb[] = this.range ? [0, 1] : [0];
    this.thumbs = [];
    return (
      <Host invalid={!!this.error}>
        {(this.label || this.showValue) && (
          <div class="head">
            {this.label && (
              <span class="label" id={labelId}>
                {this.label}
              </span>
            )}
            {this.showValue && (
              <span class="shown" aria-hidden="true">
                {shown}
              </span>
            )}
          </div>
        )}
        <div
          ref={(el) => (this.track = el)}
          class={{ track: true, dragging: this.dragging >= 0 }}
          part="track"
          onPointerDown={this.onTrackDown}
          onPointerMove={this.onTrackMove}
          onPointerUp={this.onTrackUp}
          onPointerCancel={this.onTrackUp}
        >
          <span class="rail" />
          <span class="fill" style={{ left: `${this.range ? this.pct(a) : 0}%`, width: `${this.pct(b) - (this.range ? this.pct(a) : 0)}%` }} />
          {this.markList.map((m) => (
            <span class={{ tick: true, on: m >= (this.range ? a : this.min) && m <= b }} style={{ left: `${this.pct(m)}%` }} />
          ))}
          {thumbs.map((t) => {
            const v = t === 0 ? a : b;
            return (
              <span
                ref={(el) => el && (this.thumbs[t] = el)}
                class="thumb"
                part="thumb"
                role="slider"
                tabindex={this.disabled ? -1 : 0}
                style={{ left: `${this.pct(v)}%` }}
                aria-valuemin={this.range && t === 1 ? a : this.min}
                aria-valuemax={this.range && t === 0 ? b : this.max}
                aria-valuenow={v}
                aria-valuetext={this.format(v)}
                aria-label={this.range ? [name, t === 0 ? this.t('labelFrom') : this.t('labelTo')].filter(Boolean).join(', ') : this.label ? undefined : this.ariaLabelText}
                aria-labelledby={!this.range ? labelId : undefined}
                aria-describedby={describedBy}
                aria-disabled={this.disabled ? 'true' : undefined}
                onKeyDown={this.onKey(t)}
              />
            );
          })}
        </div>
        {this.markList.length > 0 && (
          <div class="marks" aria-hidden="true">
            {this.markList.map((m) => (
              <span style={{ left: `${this.pct(m)}%` }}>{this.format(m)}</span>
            ))}
          </div>
        )}
        {this.error ? (
          <span class="error" id={`${this.uid}-error`}>
            {this.error}
          </span>
        ) : (
          this.hint && (
            <span class="hint" id={`${this.uid}-hint`}>
              {this.hint}
            </span>
          )
        )}
      </Host>
    );
  }
}
