import { AttachInternals, Component, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { fieldDisabled } from '../../utils/form-disabled';

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
  @Prop() maxlength?: number;
  @Prop({ reflect: true }) mono = false;
  @Prop({ reflect: true }) disabled = false;
  /** Set by a disabled fieldset or form; `disabled` stays the author's own. */
  @State() formDisabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  @Prop() ariaLabelText?: string;

  @Event() kernInput!: EventEmitter<{ value: string }>;
  @Event() kernChange!: EventEmitter<{ value: string }>;

  private area?: HTMLTextAreaElement;
  private uid = `kern-textarea-${++nextId}`;
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
    this.formDisabled = disabled;
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
    const describedBy = this.error ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    return (
      <Host invalid={!!this.error}>
        {this.label && (
          <label class="label" htmlFor={this.uid}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={(el) => (this.area = el)}
          id={this.uid}
          class="control"
          part="control"
          rows={this.rows}
          maxLength={this.maxlength}
          name={this.name}
          placeholder={this.placeholder}
          disabled={fieldDisabled(this)}
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
