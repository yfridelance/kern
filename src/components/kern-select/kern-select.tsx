import { optionOf } from '../../utils/options';
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';

let nextId = 0;

export interface KernOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Labelled single choice, form-associated. Options come from the `options` property or from child
 * `<option>` elements (kept in sync, so `@for` / `*ngFor` over options works).
 *
 * @slot - `<option>` elements (read, not shown)
 * @part control - The native select
 */
@Component({
  tag: 'kern-select',
  styleUrl: 'kern-select.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernSelect {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  /** Takes precedence over child `<option>` elements. */
  @Prop() options?: KernOption[];
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  @Prop() required = false;
  @Prop() ariaLabelText?: string;

  /** When the user picks an option. */
  @Event() kernChange!: EventEmitter<{ value: string }>;

  @State() childOptions: KernOption[] = [];

  private select?: HTMLSelectElement;
  private observer?: MutationObserver;
  private id = `kern-select-${++nextId}`;
  private initial = '';

  connectedCallback() {
    this.readChildren();
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    this.observer = new MutationObserver(() => this.readChildren());
    this.observer.observe(this.el, { childList: true, subtree: true, characterData: true, attributes: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  componentWillLoad() {
    this.initial = this.value ?? '';
  }

  componentDidLoad() {
    this.sync();
  }

  componentDidRender() {
    // Keep the native select in step after option lists change.
    if (this.select && this.select.value !== this.value) this.select.value = this.value;
  }

  private readChildren() {
    const opts = Array.from(this.el.querySelectorAll('option'));
    this.childOptions = opts.map((o) => optionOf(o));
    const selected = opts.find((o) => o.hasAttribute('selected'));
    if (selected && !this.value) this.value = optionOf(selected).value;
    if (!this.value && !this.options && this.childOptions.length) this.value = this.childOptions[0].value;
  }

  @Watch('value')
  @Watch('error')
  sync() {
    this.internals?.setFormValue?.(this.value ?? '');
    if (this.error) this.internals?.setValidity?.({ customError: true }, this.error, this.select);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.select);
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
    this.select?.focus();
  }

  private onChange = (ev: Event) => {
    this.value = (ev.target as HTMLSelectElement).value;
    this.kernChange.emit({ value: this.value });
  };

  render() {
    const opts = this.options ?? this.childOptions;
    const describedBy = this.error ? `${this.id}-error` : this.hint ? `${this.id}-hint` : undefined;
    return (
      <Host invalid={!!this.error}>
        {this.label && (
          <label class="label" htmlFor={this.id}>
            {this.label}
          </label>
        )}
        <span class="wrap">
          <select
            ref={(el) => (this.select = el)}
            id={this.id}
            class="control"
            part="control"
            name={this.name}
            disabled={this.disabled}
            required={this.required}
            aria-label={this.label ? undefined : this.ariaLabelText}
            aria-invalid={this.error ? 'true' : undefined}
            aria-describedby={describedBy}
            onChange={this.onChange}
          >
            {opts.map((o) => (
              <option value={o.value} disabled={o.disabled} selected={o.value === this.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Icon name="chevron" class="chevron" />
        </span>
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
        <slot />
      </Host>
    );
  }
}
