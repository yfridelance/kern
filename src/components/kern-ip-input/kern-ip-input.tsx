import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { resolveLocale } from '../../utils/datetime';
import { parseIpv4, type KernIpKind, type KernIpv4 } from '../../utils/ip';

let nextId = 0;

/**
 * IPv4 field for a single address (`192.168.1.10`), a range (`192.168.1.10-192.168.1.50`, also `192.168.1.10-50`)
 * or a CIDR block (`192.168.1.0/24`), form-associated. Typed text is applied on Enter or when leaving the field and
 * normalised; `value` and the form value are the normalised form. Ranges and blocks show their size in the field.
 */
@Component({
  tag: 'kern-ip-input',
  styleUrl: 'kern-ip-input.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernIpInput {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** Normalised address, range or CIDR block; empty when none. */
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  /** Allowed forms, space-separated: `single`, `range`, `cidr`. */
  @Prop() allow = 'single range cidr';
  /** Largest allowed number of addresses. */
  @Prop() maxAddresses?: number;
  /** Defaults to an example of the first allowed form. */
  @Prop() placeholder?: string;
  /** Hide the number of addresses in the field. */
  @Prop() hideCount = false;
  /** BCP 47 locale for the number of addresses; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  /** Shown for text that is no IPv4 address, range or CIDR block. */
  @Prop() labelInvalid = 'Keine gültige IPv4-Adresse';
  /** Shown for a form excluded by `allow`. */
  @Prop() labelNotAllowed = 'Diese Form ist hier nicht erlaubt';
  /** Shown above `max-addresses`; `{n}` is replaced by it. */
  @Prop() labelTooMany = 'Höchstens {n} Adressen';
  /** Size of a range or block; `{n}` is replaced by the number. */
  @Prop() labelCount = '{n} Adressen';

  /** On every keystroke, with the raw text. */
  @Event() kernInput!: EventEmitter<{ value: string }>;
  /** When typed text is applied: the normalised value and what it covers (empty value when cleared). */
  @Event() kernChange!: EventEmitter<{ value: string; kind?: KernIpKind; first?: string; last?: string; count?: number }>;

  @State() text = '';
  /** Own validation message, shown when `error` is not set. */
  @State() problem?: string;

  private input?: HTMLInputElement;
  private id = `kern-ip-input-${++nextId}`;
  private initial = '';

  componentWillLoad() {
    this.initial = this.value ?? '';
    this.onValue();
  }

  componentDidLoad() {
    this.sync();
  }

  /** Value set from outside → normalised text and check. */
  @Watch('value')
  onValue() {
    const ip = parseIpv4(this.value ?? '');
    this.text = ip?.value ?? this.value ?? '';
    this.problem = this.value && !ip ? this.labelInvalid : this.check(ip);
    this.sync();
  }

  @Watch('allow')
  @Watch('maxAddresses')
  onRules() {
    const ip = parseIpv4(this.value ?? '');
    if (ip) this.problem = this.check(ip);
    this.sync();
  }

  @Watch('error')
  @Watch('required')
  @Watch('problem')
  sync() {
    this.internals?.setFormValue?.(this.value ?? '');
    const message = this.error ?? this.problem;
    if (message) this.internals?.setValidity?.({ customError: true }, message, this.input);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.input);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
    this.onValue();
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Focuses the native input. */
  @Method()
  async setFocus() {
    this.input?.focus();
  }

  private get allowed(): KernIpKind[] {
    return this.allow.split(/[\s,]+/).filter((k): k is KernIpKind => k === 'single' || k === 'range' || k === 'cidr');
  }

  private check(ip: KernIpv4 | null): string | undefined {
    if (!ip) return undefined;
    if (!this.allowed.includes(ip.kind)) return this.labelNotAllowed;
    if (this.maxAddresses && ip.count > this.maxAddresses) return this.labelTooMany.replace('{n}', this.number(this.maxAddresses));
    return undefined;
  }

  private number(n: number): string {
    return new Intl.NumberFormat(resolveLocale(this.locale)).format(n);
  }

  /** Apply the typed text. */
  private commit() {
    const t = this.text.trim();
    if (!t) return this.apply('', null);
    const ip = parseIpv4(t);
    if (!ip) {
      this.problem = this.labelInvalid;
      return;
    }
    this.apply(ip.value, ip);
  }

  private apply(value: string, ip: KernIpv4 | null) {
    if (value === this.value) {
      this.onValue(); // normalise the text, e.g. „192.168.1.10 - 50“
      return;
    }
    this.value = value;
    this.kernChange.emit(ip ? { value, kind: ip.kind, first: ip.first, last: ip.last, count: ip.count } : { value });
  }

  private onInput = (ev: Event) => {
    this.text = (ev.target as HTMLInputElement).value;
    if (this.problem === this.labelInvalid) this.problem = undefined;
    this.kernInput.emit({ value: this.text });
  };

  private onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter') this.commit();
  };

  render() {
    const message = this.error ?? this.problem;
    const describedBy = message ? `${this.id}-error` : this.hint ? `${this.id}-hint` : undefined;
    const ip = parseIpv4(this.value ?? '');
    const showCount = !this.hideCount && ip && ip.kind !== 'single' && ip.value === this.text.trim();
    const first = this.allowed[0] ?? 'cidr';
    const example = { single: '192.168.1.10', range: '192.168.1.10-192.168.1.50', cidr: '192.168.1.0/24' }[first];
    return (
      <Host invalid={!!message}>
        {this.label && (
          <label class="label" htmlFor={this.id}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <div class={{ control: true, box: true, disabled: this.disabled }} part="control">
          <input
            ref={(el) => (this.input = el)}
            id={this.id}
            class="text"
            type="text"
            inputMode="decimal"
            autocomplete="off"
            spellcheck={false}
            value={this.text}
            placeholder={this.placeholder ?? example}
            disabled={this.disabled}
            readOnly={this.readonly}
            required={this.required}
            aria-label={this.label ? undefined : this.ariaLabelText}
            aria-invalid={message ? 'true' : undefined}
            aria-describedby={[describedBy, showCount ? `${this.id}-count` : undefined].filter(Boolean).join(' ') || undefined}
            onInput={this.onInput}
            onChange={() => this.commit()}
            onKeyDown={this.onKey}
          />
          {showCount && (
            <span class="count" id={`${this.id}-count`} title={`${ip.first} – ${ip.last}`}>
              {this.labelCount.replace('{n}', this.number(ip.count))}
            </span>
          )}
        </div>
        {message ? (
          <span class="error" id={`${this.id}-error`}>
            {message}
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
