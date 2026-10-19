import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, Watch, h } from '@stencil/core';

let nextId = 0;

/**
 * Labelled text field (text, password, search, number …), form-associated.
 * Use `mono` for IP, MAC, CIDR and IDs.
 *
 * @part control - The native input
 */
@Component({
  tag: 'kern-input',
  styleUrl: 'kern-input.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernInput {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  /** Error text; also marks the field invalid. */
  @Prop() error?: string;
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  @Prop() type: 'text' | 'password' | 'search' | 'email' | 'url' | 'number' | 'tel' = 'text';
  @Prop() placeholder?: string;
  @Prop() autocomplete?: string;
  @Prop() pattern?: string;
  @Prop() maxlength?: number;
  /** For `type="number"`. */
  @Prop() min?: number | string;
  @Prop() max?: number | string;
  @Prop() step?: number | string;
  @Prop({ reflect: true }) mono = false;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;

  /** On every keystroke. */
  @Event() kernInput!: EventEmitter<{ value: string }>;
  /** On every keystroke (also used by the Angular value accessor). */
  @Event() kernChange!: EventEmitter<{ value: string }>;

  private input?: HTMLInputElement;
  private uid = `kern-input-${++nextId}`;
  private initial = '';

  componentWillLoad() {
    this.initial = this.value ?? '';
  }

  componentDidLoad() {
    this.sync();
  }

  @Watch('value')
  @Watch('error')
  @Watch('required')
  sync() {
    this.internals?.setFormValue?.(this.value ?? '');
    if (this.error) this.internals?.setValidity?.({ customError: true }, this.error, this.input);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.input);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Focuses the native input. */
  @Method()
  async setFocus() {
    this.input?.focus();
  }

  /** Selects the text. */
  @Method()
  async select() {
    this.input?.select();
  }

  private onInput = (ev: Event) => {
    this.value = (ev.target as HTMLInputElement).value;
    this.kernInput.emit({ value: this.value });
    this.kernChange.emit({ value: this.value });
  };

  render() {
    const describedBy = this.error ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    return (
      <Host invalid={!!this.error}>
        {this.label && (
          <label class="label" htmlFor={this.uid}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={(el) => (this.input = el)}
          id={this.uid}
          class="control"
          part="control"
          type={this.type}
          value={this.value}
          name={this.name}
          placeholder={this.placeholder}
          autocomplete={this.autocomplete ?? (this.type === 'password' ? 'off' : undefined)}
          pattern={this.pattern}
          maxLength={this.maxlength}
          min={this.min}
          max={this.max}
          step={this.step}
          disabled={this.disabled}
          readOnly={this.readonly}
          required={this.required}
          spellcheck={false}
          aria-label={this.label ? undefined : this.ariaLabelText}
          aria-invalid={this.error ? 'true' : undefined}
          aria-describedby={describedBy}
          onInput={this.onInput}
        />
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
