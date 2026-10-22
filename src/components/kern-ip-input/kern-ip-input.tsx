import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { fieldDisabled } from '../../utils/form-disabled';
import { resolveLocale } from '../../utils/datetime';
import { parseIpv4, parseMask, type KernIpKind, type KernIpv4, type KernMask } from '../../utils/ip';
import { kernTexts } from '../../utils/i18n';

type Kind = KernIpKind | 'mask';
/** A parsed address, range or block, or a subnet mask with its normalised text. */
type Parsed = KernIpv4 | (KernMask & { kind: 'mask'; value: string });

let nextId = 0;

/**
 * IPv4 field for a single address (`192.168.1.10`), a range (`192.168.1.10-192.168.1.50`, also `192.168.1.10-50`),
 * a CIDR block (`192.168.1.0/24`) or a subnet mask (`255.255.255.0`, also `/24`), form-associated. Typed text is applied on Enter or when leaving the field and
 * normalised; `value` and the form value are the normalised form. Ranges, blocks and masks show their size in the field.
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
  /** Normalised address, range, CIDR block or mask; empty when none. */
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  /**
   * Allowed forms, space-separated: `single`, `range`, `cidr`, `mask`. `mask` accepts only contiguous subnet masks
   * (`255.255.252.0`) and prefixes (`/22`, `22`); combined with `single`, a valid mask counts as mask and
   * anything else as address.
   */
  @Prop() allow = 'single range cidr';
  /** How a mask is normalised: `dotted` (`255.255.255.0`) or `prefix` (`/24`). */
  @Prop() maskFormat: 'dotted' | 'prefix' = 'dotted';
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
  /** Set by a disabled fieldset or form; `disabled` stays the author's own. */
  @State() formDisabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  /** Shown for text that is no IPv4 address, range or CIDR block. */
  @Prop() labelInvalid?: string;
  /** Shown for a form excluded by `allow`. */
  @Prop() labelNotAllowed?: string;
  /** Shown above `max-addresses`; `{n}` is replaced by it. */
  @Prop() labelTooMany?: string;
  /** Size of a range or block; `{n}` is replaced by the number. */
  @Prop() labelCount?: string;
  /** Shown for text that is no subnet mask when only `mask` is allowed. */
  @Prop() labelInvalidMask?: string;
  /** Size of a mask; `{prefix}` is replaced by the prefix length, `{n}` by the number of hosts. */
  @Prop() labelMaskCount?: string;
  private t = kernTexts(this, 'kern-ip-input', 'sync');

  /** On every keystroke, with the raw text. */
  @Event() kernInput!: EventEmitter<{ value: string }>;
  /** When typed text is applied: the normalised value and what it covers (empty value when cleared). */
  @Event() kernChange!: EventEmitter<{
    value: string;
    kind?: KernIpKind | 'mask';
    first?: string;
    last?: string;
    count?: number;
    /** Masks only: dotted mask, prefix length and usable hosts. */
    mask?: string;
    prefix?: number;
    hosts?: number;
  }>;

  @State() text = '';
  /** Name of the text property of the own validation message, shown when `error` is not set. */
  @State() problem?: string;

  private input?: HTMLInputElement;
  private uid = `kern-ip-input-${++nextId}`;
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
  @Watch('maskFormat')
  onValue() {
    const ip = this.parse(this.value ?? '');
    this.text = ip?.value ?? this.value ?? '';
    this.problem = this.value && !ip ? this.invalid : this.check(ip);
    this.sync();
  }

  @Watch('allow')
  @Watch('maxAddresses')
  onRules() {
    const ip = this.parse(this.value ?? '');
    if (ip) this.problem = this.check(ip);
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

  private get allowed(): Kind[] {
    return this.allow.split(/[\s,]+/).filter((k): k is Kind => k === 'single' || k === 'range' || k === 'cidr' || k === 'mask');
  }

  /** Only masks allowed: other text is no address but an invalid mask. */
  private get onlyMask(): boolean {
    const allowed = this.allowed;
    return allowed.length > 0 && allowed.every((k) => k === 'mask');
  }

  private get invalid(): string {
    return this.onlyMask ? 'labelInvalidMask' : 'labelInvalid';
  }

  /** A mask when `mask` is allowed and the text is one, else an address, range or block. */
  private parse(text: string): Parsed | null {
    if (this.allowed.includes('mask')) {
      const m = parseMask(text);
      if (m) return { ...m, kind: 'mask', value: this.maskFormat === 'prefix' ? `/${m.prefix}` : m.mask };
      if (this.onlyMask) return null;
    }
    return parseIpv4(text);
  }

  private check(ip: Parsed | null): string | undefined {
    if (!ip) return undefined;
    if (!this.allowed.includes(ip.kind)) return 'labelNotAllowed';
    if (ip.kind === 'mask') return undefined;
    if (this.maxAddresses && ip.count > this.maxAddresses) return 'labelTooMany';
    return undefined;
  }

  /** The own validation message in the current language; `problem` holds the text property's name. */
  private problemText(): string | undefined {
    return this.problem && this.t(this.problem).replace('{n}', this.number(this.maxAddresses ?? 0));
  }

  private number(n: number): string {
    return new Intl.NumberFormat(resolveLocale(this.locale)).format(n);
  }

  /** Apply the typed text. */
  private commit() {
    const t = this.text.trim();
    if (!t) return this.apply('', null);
    const ip = this.parse(t);
    if (!ip) {
      this.problem = this.invalid;
      return;
    }
    this.apply(ip.value, ip);
  }

  private apply(value: string, ip: Parsed | null) {
    if (value === this.value) {
      this.onValue(); // normalise the text, e.g. „192.168.1.10 - 50“
      return;
    }
    this.value = value;
    if (!ip) this.kernChange.emit({ value });
    else if (ip.kind === 'mask') this.kernChange.emit({ value, kind: 'mask', mask: ip.mask, prefix: ip.prefix, hosts: ip.hosts });
    else this.kernChange.emit({ value, kind: ip.kind, first: ip.first, last: ip.last, count: ip.count });
  }

  private onInput = (ev: Event) => {
    this.text = (ev.target as HTMLInputElement).value;
    if (this.problem === this.invalid) this.problem = undefined;
    this.kernInput.emit({ value: this.text });
  };

  private onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter') this.commit();
  };

  render() {
    const message = this.error ?? this.problemText();
    const describedBy = message ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const ip = this.parse(this.value ?? '');
    const showCount = !this.hideCount && ip && ip.kind !== 'single' && ip.value === this.text.trim();
    const first = this.allowed[0] ?? 'cidr';
    const mask = this.maskFormat === 'prefix' ? '/24' : '255.255.255.0';
    const example = { single: '192.168.1.10', range: '192.168.1.10-192.168.1.50', cidr: '192.168.1.0/24', mask }[first];
    return (
      <Host invalid={!!message}>
        {this.label && (
          <label class="label" htmlFor={this.uid}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <div class={{ control: true, box: true, disabled: fieldDisabled(this) }} part="control">
          <input
            ref={(el) => (this.input = el)}
            id={this.uid}
            class="text"
            type="text"
            inputMode="decimal"
            autocomplete="off"
            spellcheck={false}
            value={this.text}
            placeholder={this.placeholder ?? example}
            disabled={fieldDisabled(this)}
            readOnly={this.readonly}
            required={this.required}
            aria-label={this.label ? undefined : this.ariaLabelText}
            aria-invalid={message ? 'true' : undefined}
            aria-describedby={[describedBy, showCount ? `${this.uid}-count` : undefined].filter(Boolean).join(' ') || undefined}
            onInput={this.onInput}
            onChange={() => this.commit()}
            onKeyDown={this.onKey}
          />
          {showCount && (
            <span class="count" id={`${this.uid}-count`} title={ip.kind === 'mask' ? ip.mask : `${ip.first} – ${ip.last}`}>
              {ip.kind === 'mask'
                ? this.t('labelMaskCount').replace('{prefix}', String(ip.prefix)).replace('{n}', this.number(ip.hosts))
                : this.t('labelCount').replace('{n}', this.number(ip.count))}
            </span>
          )}
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
