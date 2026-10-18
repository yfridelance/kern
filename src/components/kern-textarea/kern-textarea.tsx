import { AttachInternals, Component, Event, EventEmitter, Host, Method, Prop, Watch, h } from '@stencil/core';

let nextId = 0;

/**
 * Labelled multi-line text field, form-associated. For notes and scripts.
 *
 * @part control - The native textarea
 */
@Component({
  tag: 'kern-textarea',
  styleUrl: 'kern-textarea.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernTextarea {
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  @Prop() placeholder?: string;
  @Prop() rows = 4;
  @Prop({ reflect: true }) mono = false;
  @Prop({ reflect: true }) disabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  @Prop() ariaLabelText?: string;

  @Event() kernInput!: EventEmitter<{ value: string }>;
  @Event() kernChange!: EventEmitter<{ value: string }>;

  private area?: HTMLTextAreaElement;
  private id = `kern-textarea-${++nextId}`;
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
    if (this.error) this.internals?.setValidity?.({ customError: true }, this.error, this.area);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.area);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  @Method()
  async setFocus() {
    this.area?.focus();
  }

  private onInput = (ev: Event) => {
    this.value = (ev.target as HTMLTextAreaElement).value;
    this.kernInput.emit({ value: this.value });
    this.kernChange.emit({ value: this.value });
  };

  render() {
    const describedBy = this.error ? `${this.id}-error` : this.hint ? `${this.id}-hint` : undefined;
    return (
      <Host invalid={!!this.error}>
        {this.label && (
          <label class="label" htmlFor={this.id}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={(el) => (this.area = el)}
          id={this.id}
          class="control"
          part="control"
          rows={this.rows}
          name={this.name}
          placeholder={this.placeholder}
          disabled={this.disabled}
          readOnly={this.readonly}
          required={this.required}
          spellcheck={!this.mono}
          aria-label={this.label ? undefined : this.ariaLabelText}
          aria-invalid={this.error ? 'true' : undefined}
          aria-describedby={describedBy}
          onInput={this.onInput}
          value={this.value}
        />
        {this.error ? (
          <span class="error" id={`${this.id}-error`}>
            {this.error}
          </span>
        ) : (
          this.hint && (
            <span class="hint" id={`${this.id}-hint`}>
              {this.hint}
            </span>
          )
        )}
      </Host>
    );
  }
}
