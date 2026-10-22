import { optionOf } from '../../utils/options';
import { AttachInternals, Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { fieldDisabled } from '../../utils/form-disabled';
import type { KernOption } from '../kern-select/kern-select';

/**
 * Compact single choice for 2–5 short options (filters, Stable/Beta, DHCP/Statisch), form-associated.
 * Options from the `options` property or child `<option>` elements. Arrow keys move the selection.
 *
 * @slot - `<option>` elements (read, not shown)
 * @part segment - Each option button
 */
@Component({
  tag: 'kern-segmented',
  styleUrl: 'kern-segmented.css',
  shadow: true,
  formAssociated: true,
})
export class KernSegmented {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop({ mutable: true }) value = '';
  @Prop() options?: KernOption[];
  @Prop() name?: string;
  /** Accessible name of the group. */
  @Prop() label?: string;
  @Prop({ reflect: true }) disabled = false;
  /** Set by a disabled fieldset or form; `disabled` stays the author's own. */
  @State() formDisabled = false;

  @Event() kernChange!: EventEmitter<{ value: string }>;

  @State() childOptions: KernOption[] = [];

  private observer?: MutationObserver;
  private buttons: HTMLButtonElement[] = [];

  connectedCallback() {
    this.readChildren();
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    this.observer = new MutationObserver(() => this.readChildren());
    this.observer.observe(this.el, { childList: true, subtree: true, characterData: true, attributes: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  componentDidLoad() {
    this.sync();
  }

  private readChildren() {
    const opts = Array.from(this.el.querySelectorAll('option'));
    this.childOptions = opts.map((o) => optionOf(o));
    const selected = opts.find((o) => o.hasAttribute('selected'));
    if (selected && !this.value) this.value = optionOf(selected).value;
  }

  private get list(): KernOption[] {
    return this.options ?? this.childOptions;
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  @Watch('value')
  sync() {
    this.internals?.setFormValue?.(this.value ?? '');
  }

  private pick(opt: KernOption, focus = false) {
    if (opt.disabled || fieldDisabled(this)) return;
    if (opt.value !== this.value) {
      this.value = opt.value;
      this.kernChange.emit({ value: this.value });
    }
    if (focus) {
      const i = this.list.indexOf(opt);
      requestAnimationFrame(() => this.buttons[i]?.focus());
    }
  }

  private onKey = (ev: KeyboardEvent) => {
    const opts = this.list.filter((o) => !o.disabled);
    const i = opts.findIndex((o) => o.value === this.value);
    let next: KernOption | undefined;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') next = opts[(i + 1) % opts.length];
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') next = opts[(i - 1 + opts.length) % opts.length];
    if (ev.key === 'Home') next = opts[0];
    if (ev.key === 'End') next = opts[opts.length - 1];
    if (next) {
      ev.preventDefault();
      this.pick(next, true);
    }
  };

  render() {
    const list = this.list;
    const hasSelection = list.some((o) => o.value === this.value);
    this.buttons = [];
    return (
      <Host>
        <div class="group" role="radiogroup" aria-label={this.label} aria-disabled={fieldDisabled(this) ? 'true' : undefined} onKeyDown={this.onKey}>
          {list.map((o, i) => {
            const selected = o.value === this.value;
            return (
              <button
                ref={(el) => el && (this.buttons[i] = el)}
                type="button"
                role="radio"
                part="segment"
                class="segment"
                aria-checked={selected ? 'true' : 'false'}
                tabIndex={selected || (!hasSelection && i === 0) ? 0 : -1}
                disabled={o.disabled || fieldDisabled(this)}
                onClick={() => this.pick(o)}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <slot />
      </Host>
    );
  }
}
