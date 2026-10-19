import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { resolveLocale } from '../../utils/datetime';

let nextId = 0;

/** Decimal places of a number, e.g. 0.25 → 2. */
function decimals(n: number): number {
  const s = String(n);
  return s.includes('e-') ? Number(s.split('e-')[1]) : (s.split('.')[1] ?? '').length;
}

/**
 * Number field with − and + buttons, form-associated. `value` is a number (`''` when empty); typed text is applied on
 * Enter or when leaving the field, limited to `min`/`max` and rounded to the decimals of `step`. Accepts the locale's
 * decimal comma. Keyboard: Arrow Up/Down ± `step`, Page Up/Down ± 10 × `step`, Home/End = `min`/`max`; holding a
 * button repeats.
 *
 * @part control - The field box
 */
@Component({
  tag: 'kern-step-input',
  styleUrl: 'kern-step-input.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernStepInput {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** The number, or `''` when empty. */
  @Prop({ mutable: true }) value: number | '' = '';
  @Prop() name?: string;
  @Prop() min?: number;
  @Prop() max?: number;
  /** Step for buttons and keys; its decimals set the precision (0.5 → one decimal). */
  @Prop() step = 1;
  /** Unit after the number, e.g. „°C“, „%“, „s“. */
  @Prop() unit?: string;
  @Prop() placeholder?: string;
  /** BCP 47 locale for the decimal separator; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  @Prop() labelDecrease = 'Verringern';
  @Prop() labelIncrease = 'Erhöhen';
  /** Shown for text that is not a number. */
  @Prop() labelInvalid = 'Keine gültige Zahl';

  /** When the number changes (`null` when emptied). */
  @Event() kernChange!: EventEmitter<{ value: number | null }>;

  @State() text = '';
  /** Own validation message, shown when `error` is not set. */
  @State() problem?: string;

  private input?: HTMLInputElement;
  private uid = `kern-step-input-${++nextId}`;
  private initial: number | '' = '';
  private repeat?: ReturnType<typeof setTimeout>;

  componentWillLoad() {
    this.initial = this.value;
    this.onValue();
  }

  componentDidLoad() {
    this.sync();
  }

  disconnectedCallback() {
    this.stopRepeat();
  }

  /** The value as a number, null when empty or not a number. */
  private get num(): number | null {
    if (this.value === '' || this.value === null || this.value === undefined) return null;
    const n = Number(this.value);
    return Number.isFinite(n) ? n : null;
  }

  private get places(): number {
    return decimals(this.step);
  }

  private format(n: number | null): string {
    if (n === null) return '';
    return new Intl.NumberFormat(resolveLocale(this.locale), { minimumFractionDigits: this.places, maximumFractionDigits: this.places, useGrouping: false }).format(n);
  }

  /** Clamp to min/max and round to the step's decimals. */
  private normalise(n: number): number {
    let v = n;
    if (this.min !== undefined && v < this.min) v = this.min;
    if (this.max !== undefined && v > this.max) v = this.max;
    return Number(v.toFixed(this.places));
  }

  /** Typed text → number; accepts „21,5“, „21.5“, „1’000“. Null when not a number, undefined when empty. */
  private parse(text: string): number | null | undefined {
    const t = text.trim().replace(/[\s'’]/g, '');
    if (!t) return undefined;
    if (!/^[-+]?(\d+([.,]\d*)?|[.,]\d+)$/.test(t)) return null;
    return Number(t.replace(',', '.'));
  }

  @Watch('value')
  @Watch('locale')
  @Watch('step')
  onValue() {
    // Attributes arrive as strings („21.5“); keep the property a number (or '').
    if (typeof this.value === 'string' && this.value !== '') {
      this.value = this.num ?? '';
      return; // the watcher runs again with the number
    }
    this.text = this.format(this.num);
    this.problem = undefined;
    this.sync();
  }

  @Watch('error')
  @Watch('required')
  @Watch('problem')
  sync() {
    const n = this.num;
    this.internals?.setFormValue?.(n === null ? '' : String(n));
    const message = this.error ?? this.problem;
    if (message) this.internals?.setValidity?.({ customError: true }, message, this.input);
    else if (this.required && n === null) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.input);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
    this.onValue();
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Focuses the field. */
  @Method()
  async setFocus() {
    this.input?.focus();
  }

  private setNumber(n: number | null) {
    const next = n === null ? null : this.normalise(n);
    if (next === this.num) return this.onValue(); // normalise the text, e.g. „21,50“ → „21,5“
    this.value = next === null ? '' : next;
    this.kernChange.emit({ value: next });
  }

  private stepBy(times: number) {
    if (this.disabled || this.readonly) return;
    // Typed but not yet applied text counts; from empty, start at min (or 0) instead of a step past it.
    const typed = this.parse(this.text);
    const base = typeof typed === 'number' ? typed : this.num;
    this.setNumber(base === null ? (this.min ?? 0) : base + times * this.step);
  }

  private commit() {
    const n = this.parse(this.text);
    if (n === undefined) return this.setNumber(null);
    if (n === null) {
      this.problem = this.labelInvalid;
      return;
    }
    this.setNumber(n);
  }

  private onKey = (ev: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowUp: () => this.stepBy(1),
      ArrowDown: () => this.stepBy(-1),
      PageUp: () => this.stepBy(10),
      PageDown: () => this.stepBy(-10),
      Home: () => this.setNumber(this.min!),
      End: () => this.setNumber(this.max!),
      Enter: () => this.commit(),
    };
    if (!keys[ev.key] || this.readonly) return;
    // Without min/max, Home/End keep moving the caret.
    if ((ev.key === 'Home' && this.min === undefined) || (ev.key === 'End' && this.max === undefined)) return;
    if (ev.key !== 'Enter') ev.preventDefault();
    keys[ev.key]();
  };

  private onInput = (ev: Event) => {
    this.text = (ev.target as HTMLInputElement).value;
    if (this.problem) this.problem = undefined;
  };

  /** Press on a button: one step now, then repeat while held. */
  private startRepeat = (dir: 1 | -1) => (ev: PointerEvent) => {
    if (ev.button !== 0) return;
    ev.preventDefault(); // keep the focus in the field
    this.input?.focus();
    this.stepBy(dir);
    this.stopRepeat();
    const tick = () => {
      this.stepBy(dir);
      this.repeat = setTimeout(tick, 80);
    };
    this.repeat = setTimeout(tick, 400);
  };

  private stopRepeat = () => {
    clearTimeout(this.repeat);
    this.repeat = undefined;
  };

  render() {
    const message = this.error ?? this.problem;
    const describedBy = message ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const n = this.num;
    const locked = this.disabled || this.readonly;
    const atMin = n !== null && this.min !== undefined && n <= this.min;
    const atMax = n !== null && this.max !== undefined && n >= this.max;
    const button = (dir: 1 | -1) => (
      <button
        type="button"
        class={{ icon: true, step: true, [dir > 0 ? 'increase' : 'decrease']: true }}
        tabindex={-1}
        aria-label={dir > 0 ? this.labelIncrease : this.labelDecrease}
        title={dir > 0 ? this.labelIncrease : this.labelDecrease}
        disabled={locked || (dir > 0 ? atMax : atMin)}
        onPointerDown={this.startRepeat(dir)}
        onPointerUp={this.stopRepeat}
        onPointerLeave={this.stopRepeat}
        onPointerCancel={this.stopRepeat}
      >
        <Icon name={dir > 0 ? 'plus' : 'minus'} />
      </button>
    );
    return (
      <Host invalid={!!message}>
        {this.label && (
          <label class="label" htmlFor={this.uid}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <div class={{ control: true, box: true, disabled: this.disabled }} part="control">
          {button(-1)}
          <input
            ref={(el) => (this.input = el)}
            id={this.uid}
            class="text"
            type="text"
            inputMode={this.places ? 'decimal' : 'numeric'}
            autocomplete="off"
            spellcheck={false}
            role="spinbutton"
            value={this.text}
            placeholder={this.placeholder}
            disabled={this.disabled}
            readOnly={this.readonly}
            required={this.required}
            aria-valuenow={n ?? undefined}
            aria-valuemin={this.min}
            aria-valuemax={this.max}
            aria-valuetext={n === null ? undefined : [this.format(n), this.unit].filter(Boolean).join(' ')}
            aria-label={this.label ? undefined : this.ariaLabelText}
            aria-invalid={message ? 'true' : undefined}
            aria-describedby={describedBy}
            onInput={this.onInput}
            onChange={() => this.commit()}
            onKeyDown={this.onKey}
          />
          {this.unit && (
            <span class="unit" aria-hidden="true">
              {this.unit}
            </span>
          )}
          {button(1)}
        </div>
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
