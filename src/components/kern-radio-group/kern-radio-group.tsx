import { AttachInternals, Component, Element, Event, EventEmitter, Host, Listen, Method, Prop, Watch, h } from '@stencil/core';

let nextId = 0;

type Radio = HTMLElement & { value?: string; disabled?: boolean; checked?: boolean };

// Children may not be upgraded yet when the group first reads them: fall back to their attributes.
const valueOf = (r: Radio) => r.value ?? r.getAttribute('value') ?? '';
const isDisabled = (r: Radio) => r.disabled ?? r.hasAttribute('disabled');

/**
 * Single choice from kern-radio children, form-associated. For longer or described options; for 2–5 short ones use
 * kern-segmented. One tab stop: arrow keys move and select (wrapping), Space/Enter selects the focused option.
 *
 * @slot - kern-radio elements
 */
@Component({
  tag: 'kern-radio-group',
  styleUrl: 'kern-radio-group.css',
  shadow: true,
  formAssociated: true,
})
export class KernRadioGroup {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** Value of the checked kern-radio, empty when none. */
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  /** Layout of the options. */
  @Prop({ reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';
  @Prop({ reflect: true }) disabled = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;

  /** When the user picks an option. */
  @Event() kernChange!: EventEmitter<{ value: string }>;

  private uid = `kern-radio-group-${++nextId}`;
  private initial = '';

  private get radios(): Radio[] {
    return Array.from(this.el.querySelectorAll<Radio>('kern-radio'));
  }

  private get enabled(): Radio[] {
    return this.radios.filter((r) => !isDisabled(r));
  }

  componentWillLoad() {
    if (!this.value) {
      const marked = this.radios.find((r) => r.hasAttribute('checked'));
      this.value = marked ? valueOf(marked) : '';
    }
    this.initial = this.value;
  }

  componentDidLoad() {
    this.sync();
  }

  @Watch('value')
  @Watch('disabled')
  @Watch('error')
  @Watch('required')
  sync() {
    const radios = this.radios;
    const current = radios.find((r) => valueOf(r) === this.value && !isDisabled(r));
    const stop = current ?? this.enabled[0];
    for (const r of radios) {
      r.checked = valueOf(r) === this.value;
      r.tabIndex = !this.disabled && r === stop ? 0 : -1;
    }
    this.internals?.setFormValue?.(this.value || null);
    if (this.error) this.internals?.setValidity?.({ customError: true }, this.error, stop);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', stop);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Focuses the checked option (or the first). */
  @Method()
  async setFocus() {
    (this.radios.find((r) => r.tabIndex === 0) ?? this.enabled[0])?.focus();
  }

  private pick(radio: Radio, focus = false) {
    if (this.disabled || isDisabled(radio)) return;
    if (valueOf(radio) !== this.value) {
      this.value = valueOf(radio);
      this.kernChange.emit({ value: this.value });
    }
    if (focus) radio.focus();
  }

  @Listen('kernRadioSelect')
  onSelect(ev: CustomEvent<{ value: string }>) {
    ev.stopPropagation();
    this.pick(ev.target as Radio, true);
  }

  @Listen('keydown')
  onKey(ev: KeyboardEvent) {
    const list = this.enabled;
    if (!list.length || this.disabled) return;
    const focused = (ev.target as HTMLElement).closest?.('kern-radio') as Radio | null;
    const i = Math.max(0, list.findIndex((r) => r === focused));
    const moves: Record<string, number> = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 };
    if (!(ev.key in moves)) return;
    ev.preventDefault();
    this.pick(list[(moves[ev.key] + list.length) % list.length], true);
  }

  render() {
    const describedBy = this.error ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const labelId = this.label ? `${this.uid}-label` : undefined;
    return (
      <Host invalid={!!this.error}>
        {this.label && (
          <span class="label" id={labelId}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </span>
        )}
        <div
          class="options"
          role="radiogroup"
          aria-labelledby={labelId}
          aria-label={this.label ? undefined : this.ariaLabelText}
          aria-describedby={describedBy}
          aria-orientation={this.orientation}
          aria-required={this.required ? 'true' : undefined}
          aria-invalid={this.error ? 'true' : undefined}
          aria-disabled={this.disabled ? 'true' : undefined}
        >
          <slot onSlotchange={() => this.sync()} />
        </div>
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
