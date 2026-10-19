import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { positionPopup } from '../../utils/popover';
import { dayPeriods, isoTime, parseTime, resolveLocale, timeSteps, uses12h } from '../../utils/datetime';

let nextId = 0;

type Segment = 'hour' | 'minute' | 'second' | 'period';

/**
 * Time field with segments (hours, minutes, optional seconds and AM/PM), form-associated. The value is
 * `HH:mm` (or `HH:mm:ss` with `seconds`), empty while a segment is missing.
 *
 * Keyboard per segment: Arrow Up/Down change it (minutes in `step`), digits type it and move on, Arrow Left/Right
 * switch segments, Backspace clears, A/P set AM/PM. With `list`, a button opens a list of times
 * (every `step`, at least 5 minutes; every 30 minutes when `step` is smaller).
 *
 * @part control - The field box
 * @part listbox - The popover list
 */
@Component({
  tag: 'kern-time-picker',
  styleUrl: 'kern-time-picker.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernTimePicker {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** `HH:mm` or `HH:mm:ss`, empty when none. */
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  /** Step in seconds for Arrow Up/Down and the list, like `<input type="time">` (900 = 15 min). */
  @Prop() step = 60;
  /** Seconds segment. */
  @Prop() seconds = false;
  /** 12-hour clock with AM/PM; defaults to the locale. */
  @Prop() hour12?: boolean;
  /** Earliest allowed time `HH:mm`. */
  @Prop() min?: string;
  /** Latest allowed time `HH:mm`. */
  @Prop() max?: string;
  /** Button with a list of times. */
  @Prop() list = false;
  /** BCP 47 locale; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  @Prop() labelHour = 'Stunden';
  @Prop() labelMinute = 'Minuten';
  @Prop() labelSecond = 'Sekunden';
  @Prop() labelPeriod = 'Vormittag/Nachmittag';
  @Prop() labelList = 'Zeit wählen';
  /** Shown for a time outside min/max. */
  @Prop() labelOutOfRange = 'Zeit nicht erlaubt';

  /** When the time changes (complete, or cleared). */
  @Event() kernChange!: EventEmitter<{ value: string }>;

  @State() hour: number | null = null;
  @State() minute: number | null = null;
  @State() second: number | null = null;
  @State() open = false;
  @State() active = -1;
  @State() problem?: string;

  private segs: Partial<Record<Segment, HTMLElement>> = {};
  private box?: HTMLElement;
  private popup?: HTMLElement;
  private listbox?: HTMLElement;
  private uid = `kern-time-picker-${++nextId}`;
  private initial = '';
  private typed = '';
  private wasOpen = false;

  componentWillLoad() {
    this.initial = this.value ?? '';
    this.read();
  }

  componentDidLoad() {
    this.sync();
    const p = this.popup;
    if (!p) return;
    p.setAttribute('popover', 'auto');
    p.addEventListener('toggle', (e) => this.onToggle(e as ToggleEvent));
  }

  disconnectedCallback() {
    this.stopTracking();
  }

  /** Value → segments. */
  @Watch('value')
  read() {
    const secs = parseTime(this.value);
    if (secs === null) {
      if (!this.value) this.hour = this.minute = this.second = null;
    } else {
      this.hour = Math.floor(secs / 3600);
      this.minute = Math.floor(secs / 60) % 60;
      this.second = secs % 60;
    }
    this.problem = this.check();
    this.sync();
  }

  @Watch('min')
  @Watch('max')
  onBounds() {
    this.problem = this.check();
    this.sync();
  }

  @Watch('error')
  @Watch('required')
  @Watch('problem')
  sync() {
    this.internals?.setFormValue?.(this.value ?? '');
    const message = this.error ?? this.problem;
    const anchor = this.segs.hour;
    if (message) this.internals?.setValidity?.({ customError: true }, message, anchor);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', anchor);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
    this.read();
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  @Method()
  async setFocus() {
    this.segs.hour?.focus();
  }

  /** Opens the list (with `list`). */
  @Method()
  async show() {
    this.openList();
  }

  /** Closes the list. */
  @Method()
  async hide() {
    this.closeList();
  }

  private get twelve(): boolean {
    return this.hour12 ?? uses12h(this.locale);
  }

  private get segments(): Segment[] {
    return ['hour', 'minute', ...(this.seconds ? (['second'] as const) : []), ...(this.twelve ? (['period'] as const) : [])];
  }

  private get secs(): number | null {
    if (this.hour === null || this.minute === null || (this.seconds && this.second === null)) return null;
    return this.hour * 3600 + this.minute * 60 + (this.seconds ? this.second! : 0);
  }

  private check(): string | undefined {
    const s = parseTime(this.value);
    if (s === null) return undefined;
    const lo = parseTime(this.min);
    const hi = parseTime(this.max);
    return (lo !== null && s < lo) || (hi !== null && s > hi) ? this.labelOutOfRange : undefined;
  }

  /** Segments → value; emits when it changed. */
  private apply() {
    const s = this.secs;
    const next = s === null ? '' : isoTime(s, this.seconds);
    if (next === this.value) return;
    this.value = next;
    this.kernChange.emit({ value: next });
  }

  private setSegment(seg: Segment, n: number | null) {
    if (seg === 'hour') this.hour = n;
    else if (seg === 'minute') this.minute = n;
    else if (seg === 'second') this.second = n;
    this.apply();
  }

  private focusSegment(seg?: Segment) {
    if (seg) this.segs[seg]?.focus();
  }

  private neighbour(seg: Segment, dir: 1 | -1): Segment | undefined {
    const list = this.segments;
    return list[list.indexOf(seg) + dir];
  }

  /** Arrow Up/Down: minutes and seconds move in `step`, the others by one; wraps around. */
  private spin(seg: Segment, dir: 1 | -1) {
    if (seg === 'period') {
      this.hour = ((this.hour ?? 0) + 12) % 24;
      if (this.minute === null) this.minute = 0;
      if (this.seconds && this.second === null) this.second = 0;
      return this.apply();
    }
    const by = seg === 'minute' && this.step >= 60 ? Math.max(1, Math.round(this.step / 60) % 60 || 1) : seg === 'second' && this.step < 60 ? Math.max(1, this.step) : 1;
    const size = seg === 'hour' ? 24 : 60;
    const cur = seg === 'hour' ? this.hour : seg === 'minute' ? this.minute : this.second;
    let next: number;
    if (cur === null) next = dir > 0 ? 0 : size - by;
    else next = (Math.floor(cur / by) * by + (cur % by && dir < 0 ? 0 : dir * by) + size) % size;
    // Fill the others so one key press gives a complete time.
    if (seg !== 'hour' && this.hour === null) this.hour = 0;
    if (seg !== 'minute' && this.minute === null) this.minute = 0;
    if (this.seconds && seg !== 'second' && this.second === null) this.second = 0;
    this.setSegment(seg, next);
  }

  /** Digits: two per segment; moves on when no further digit could follow. */
  private type(seg: Exclude<Segment, 'period'>, digit: string) {
    const twelve = seg === 'hour' && this.twelve;
    const max = seg === 'hour' ? (twelve ? 12 : 23) : 59;
    this.typed = (this.typed + digit).slice(-2);
    let n = Number(this.typed);
    if (n > max) {
      this.typed = digit;
      n = Number(digit);
    }
    if (twelve) {
      const pm = (this.hour ?? 0) >= 12;
      this.setSegment('hour', n === 0 ? null : (n % 12) + (pm ? 12 : 0));
    } else {
      this.setSegment(seg, n);
    }
    if (this.typed.length === 2 || n * 10 > max) {
      this.typed = '';
      this.focusSegment(this.neighbour(seg, 1));
    }
  }

  private onSegKey = (seg: Segment) => (ev: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;
    const k = ev.key;
    if (k === 'ArrowUp' || k === 'ArrowDown') {
      ev.preventDefault();
      if (ev.altKey && this.list) return this.openList();
      this.typed = '';
      this.spin(seg, k === 'ArrowUp' ? 1 : -1);
    } else if (k === 'ArrowLeft' || k === 'ArrowRight') {
      ev.preventDefault();
      this.typed = '';
      this.focusSegment(this.neighbour(seg, k === 'ArrowRight' ? 1 : -1));
    } else if (k === 'Backspace' || k === 'Delete') {
      ev.preventDefault();
      this.typed = '';
      if (seg === 'period') return;
      this.setSegment(seg, null);
    } else if (/^\d$/.test(k) && seg !== 'period') {
      ev.preventDefault();
      this.type(seg, k);
    } else if (seg === 'period' && /^[ap]$/i.test(k)) {
      ev.preventDefault();
      const pm = k.toLowerCase() === 'p';
      if (this.hour === null) this.hour = pm ? 12 : 0;
      else if (pm !== this.hour >= 12) this.hour = (this.hour + 12) % 24;
      if (this.minute === null) this.minute = 0;
      this.apply();
    } else if (k === ':' || k === '.') {
      ev.preventDefault();
      this.typed = '';
      this.focusSegment(this.neighbour(seg, 1));
    }
  };

  // ---------- list ----------

  private get options(): number[] {
    const step = this.step >= 300 ? this.step : 1800;
    return timeSteps(step, parseTime(this.min) ?? 0, parseTime(this.max) ?? 86_399);
  }

  private openList() {
    if (!this.list || this.disabled || this.readonly || this.open || !this.popup) return;
    const opts = this.options;
    const s = this.secs;
    // The selected time, else the first one at or after it.
    let i = s === null ? -1 : opts.findIndex((o) => o >= s);
    if (i < 0) i = s === null ? 0 : opts.length - 1;
    this.active = i;
    (this.popup as HTMLElement & { showPopover?: () => void }).showPopover?.();
  }

  private closeList(refocus = true) {
    if (!this.open) return;
    (this.popup as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
    if (refocus) this.segs.hour?.focus();
  }

  private onToggle(e: ToggleEvent) {
    this.open = e.newState === 'open';
    if (this.open) {
      this.position();
      this.startTracking();
      requestAnimationFrame(() => {
        this.listbox?.focus();
        this.scrollActive();
      });
    } else {
      this.stopTracking();
      const focused = this.el.shadowRoot?.activeElement;
      if (focused && this.popup?.contains(focused)) this.segs.hour?.focus();
    }
  }

  private position = () => {
    if (this.box && this.popup) positionPopup(this.box, this.popup, { matchWidth: true, maxHeight: 280 });
  };

  private startTracking() {
    window.addEventListener('scroll', this.position, true);
    window.addEventListener('resize', this.position);
  }

  private stopTracking() {
    window.removeEventListener('scroll', this.position, true);
    window.removeEventListener('resize', this.position);
  }

  private scrollActive() {
    this.listbox?.querySelector<HTMLElement>(`#${this.uid}-opt-${this.active}`)?.scrollIntoView?.({ block: 'nearest' });
  }

  private pick(secs: number) {
    this.hour = Math.floor(secs / 3600);
    this.minute = Math.floor(secs / 60) % 60;
    this.second = secs % 60;
    this.apply();
    this.closeList();
  }

  private onListKey = (ev: KeyboardEvent) => {
    const n = this.options.length;
    const moves: Record<string, number> = { ArrowDown: this.active + 1, ArrowUp: this.active - 1, Home: 0, End: n - 1, PageDown: this.active + 8, PageUp: this.active - 8 };
    if (ev.key in moves) {
      ev.preventDefault();
      this.active = Math.max(0, Math.min(n - 1, moves[ev.key]));
      requestAnimationFrame(() => this.scrollActive());
    } else if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      const o = this.options[this.active];
      if (o !== undefined) this.pick(o);
    }
  };

  private onButtonPointerDown = () => {
    this.wasOpen = this.open;
  };

  private onButtonClick = () => {
    if (this.wasOpen) {
      this.wasOpen = false;
      return;
    }
    this.openList();
  };

  private onPopupFocusOut = (ev: FocusEvent) => {
    const next = ev.relatedTarget as Node | null;
    if (!next || this.popup?.contains(next) || this.el.contains(next)) return;
    this.closeList(false);
  };

  private onBoxClick = (ev: MouseEvent) => {
    // Clicks beside the segments focus the first empty one, else the hour.
    if ((ev.target as HTMLElement).closest('.seg, .icon')) return;
    const empty = this.segments.find((s) => (s === 'hour' ? this.hour : s === 'minute' ? this.minute : s === 'second' ? this.second : 0) === null);
    this.focusSegment(empty ?? 'hour');
  };

  // ---------- render ----------

  private display(seg: Segment): string | null {
    const two = (n: number | null) => (n === null ? null : String(n).padStart(2, '0'));
    if (seg === 'hour') return this.hour === null ? null : this.twelve ? two(this.hour % 12 || 12) : two(this.hour);
    if (seg === 'minute') return two(this.minute);
    if (seg === 'second') return two(this.second);
    if (this.hour === null) return null;
    return dayPeriods(this.locale)[this.hour >= 12 ? 1 : 0];
  }

  private renderSegment(seg: Segment) {
    const text = this.display(seg);
    const labels = { hour: this.labelHour, minute: this.labelMinute, second: this.labelSecond, period: this.labelPeriod };
    const range = seg === 'hour' ? (this.twelve ? [1, 12] : [0, 23]) : seg === 'period' ? undefined : [0, 59];
    return (
      <span
        ref={(el) => (this.segs[seg] = el)}
        class={{ seg: true, empty: text === null, [seg]: true }}
        role="spinbutton"
        tabindex={this.disabled ? undefined : 0}
        id={seg === 'hour' ? this.uid : undefined}
        aria-label={[this.label ?? this.ariaLabelText, labels[seg]].filter(Boolean).join(', ')}
        aria-valuemin={range?.[0]}
        aria-valuemax={range?.[1]}
        aria-valuenow={seg !== 'period' && text !== null ? Number(text) : undefined}
        aria-valuetext={text ?? '–'}
        aria-disabled={this.disabled ? 'true' : undefined}
        aria-readonly={this.readonly ? 'true' : undefined}
        onKeyDown={this.onSegKey(seg)}
        onBlur={() => (this.typed = '')}
      >
        {text ?? '––'}
      </span>
    );
  }

  render() {
    const message = this.error ?? this.problem;
    const describedBy = message ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const labelId = this.label ? `${this.uid}-label` : undefined;
    const opts = this.list ? this.options : [];
    const current = this.secs;
    const fmt = new Intl.DateTimeFormat(resolveLocale(this.locale), { hour: '2-digit', minute: '2-digit', hour12: this.twelve });
    return (
      <Host invalid={!!message}>
        {this.label && (
          <label class="label" id={labelId} htmlFor={this.uid} onClick={() => this.segs.hour?.focus()}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <div
          ref={(el) => (this.box = el)}
          class={{ control: true, box: true, disabled: this.disabled }}
          part="control"
          role="group"
          aria-labelledby={labelId}
          aria-label={this.label ? undefined : this.ariaLabelText}
          aria-describedby={describedBy}
          aria-invalid={message ? 'true' : undefined}
          onClick={this.onBoxClick}
        >
          <span class="segments">
            {this.segments.map((seg, i) => [
              i > 0 && seg !== 'period' && <span class="sep">:</span>,
              i > 0 && seg === 'period' && <span class="gap" />,
              this.renderSegment(seg),
            ])}
          </span>
          {this.list && (
            <button
              type="button"
              class="icon open"
              aria-label={this.labelList}
              title={this.labelList}
              aria-haspopup="listbox"
              aria-expanded={this.open ? 'true' : 'false'}
              disabled={this.disabled || this.readonly}
              onPointerDown={this.onButtonPointerDown}
              onClick={this.onButtonClick}
            >
              <Icon name="clock" />
            </button>
          )}
        </div>
        {this.list && (
          <div ref={(el) => (this.popup = el)} class="popup list" part="listbox" onFocusout={this.onPopupFocusOut}>
            <div
              ref={(el) => (this.listbox = el)}
              class="listbox"
              role="listbox"
              tabIndex={-1}
              aria-label={this.label ?? this.ariaLabelText}
              aria-activedescendant={this.active >= 0 ? `${this.uid}-opt-${this.active}` : undefined}
              onKeyDown={this.onListKey}
            >
              {opts.map((o, i) => (
                <div
                  id={`${this.uid}-opt-${i}`}
                  class={{ option: true, active: i === this.active, selected: o === current }}
                  role="option"
                  aria-selected={o === current ? 'true' : 'false'}
                  onPointerMove={() => i !== this.active && (this.active = i)}
                  onClick={() => this.pick(o)}
                >
                  {fmt.format(new Date(2026, 0, 1, Math.floor(o / 3600), Math.floor(o / 60) % 60))}
                </div>
              ))}
            </div>
          </div>
        )}
        {message ? (
          <span class="error" id={`${this.uid}-error`}>
            {message}
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
