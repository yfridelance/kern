import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { fieldDisabled } from '../../utils/form-disabled';
import { implicitSubmit } from '../../utils/implicit-submit';
import { formatMac, parseMac, type KernMacFormat } from '../../utils/mac';
import { kernTexts } from '../../utils/i18n';

let nextId = 0;

/**
 * MAC address field, form-associated. Accepts every common notation (`C82B961A3F00`, `c8:2b:…`, `c8-2b-…`,
 * `c82b.961a.3f00`) and normalises on Enter or when leaving the field to `format` and `letter-case`; `value` and the
 * form value are the normalised form.
 */
@Component({
  tag: 'kern-mac-input',
  styleUrl: 'kern-mac-input.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernMacInput {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** Normalised MAC address; empty when none. */
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  /** Notation of `value`: `C8:2B:…` (colon), `C8-2B-…` (dash), `c82b.961a.3f00` (dot), `C82B961A3F00` (plain). */
  @Prop() format: KernMacFormat = 'colon';
  @Prop() letterCase: 'upper' | 'lower' = 'upper';
  /** Defaults to an example in `format`. */
  @Prop() placeholder?: string;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  /** Set by a disabled fieldset or form; `disabled` stays the author's own. */
  @State() formDisabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  /** Enter does not submit the surrounding form. */
  @Prop() noImplicitSubmit = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  @Prop() labelInvalid?: string;
  private t = kernTexts(this, 'kern-mac-input', 'sync');

  /** On every keystroke, with the raw text. */
  @Event() kernInput!: EventEmitter<{ value: string }>;
  /** When typed text is applied, with the normalised value (empty when cleared). */
  @Event() kernChange!: EventEmitter<{ value: string }>;

  @State() text = '';
  /** Name of the text property of the own validation message, shown when `error` is not set. */
  @State() problem?: string;

  private input?: HTMLInputElement;
  private uid = `kern-mac-input-${++nextId}`;
  private initial = '';

  componentWillLoad() {
    this.initial = this.value ?? '';
    this.onValue();
  }

  componentDidLoad() {
    this.sync();
  }

  private normalise(text: string): string | null {
    const hex = parseMac(text);
    return hex ? formatMac(hex, this.format, this.letterCase !== 'lower') : null;
  }

  /** Value set from outside → normalised text and check. */
  @Watch('value')
  @Watch('format')
  @Watch('letterCase')
  onValue() {
    const v = this.value ?? '';
    const norm = v ? this.normalise(v) : '';
    if (norm && norm !== v) {
      this.value = norm; // the watcher runs again with the normalised value
      return;
    }
    this.text = v;
    this.problem = v && norm === null ? 'labelInvalid' : undefined;
    this.sync();
  }

  @Watch('error')
  @Watch('required')
  @Watch('problem')
  sync() {
    this.internals?.setFormValue?.(this.value ?? '');
    const message = this.error ?? this.problemText();
    if (message) this.internals?.setValidity?.({ customError: true }, message, this.input);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.input);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
    this.onValue();
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  /** Focuses the native input. */
  @Method()
  async setFocus() {
    this.input?.focus();
  }

  /** Apply the typed text. */
  private commit() {
    const t = this.text.trim();
    const next = t ? this.normalise(t) : '';
    if (next === null) {
      this.problem = 'labelInvalid';
      return;
    }
    if (next === this.value) {
      this.onValue(); // normalise the text, e.g. „c82b961a3f00“ → „C8:2B:96:1A:3F:00“
      return;
    }
    this.value = next;
    this.kernChange.emit({ value: next });
  }

  private onInput = (ev: Event) => {
    this.text = (ev.target as HTMLInputElement).value;
    if (this.problem === 'labelInvalid') this.problem = undefined;
    this.kernInput.emit({ value: this.text });
  };

  private onKey = (ev: KeyboardEvent) => {
    if (ev.key !== 'Enter') return;
    this.commit();
    implicitSubmit(this, ev);
  };

  /** The own validation message in the current language; `problem` holds the text property's name. */
  private problemText(): string | undefined {
    return this.problem && this.t(this.problem);
  }

  render() {
    const message = this.error ?? this.problemText();
    const describedBy = message ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    return (
      <Host invalid={!!message}>
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
          type="text"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck={false}
          value={this.text}
          placeholder={this.placeholder ?? formatMac('c82b961a3f00', this.format, this.letterCase !== 'lower')}
          disabled={fieldDisabled(this)}
          readOnly={this.readonly}
          required={this.required}
          aria-label={this.label ? undefined : this.ariaLabelText}
          aria-invalid={message ? 'true' : undefined}
          aria-describedby={describedBy}
          onInput={this.onInput}
          onChange={() => this.commit()}
          onKeyDown={this.onKey}
        />
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
