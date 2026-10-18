import { AttachInternals, Component, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';

/**
 * Checkbox for selection and filters ("nur mit Firmware-Update", device selection), form-associated.
 *
 * @slot - Label text
 * @part box - The visible box
 */
@Component({
  tag: 'kern-checkbox',
  styleUrl: 'kern-checkbox.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernCheckbox {
  @AttachInternals() internals!: ElementInternals;

  @Prop({ mutable: true, reflect: true }) checked = false;
  /** Mixed state, e.g. "some devices selected". Cleared on user input. */
  @Prop({ mutable: true, reflect: true }) indeterminate = false;
  @Prop({ reflect: true }) disabled = false;
  @Prop() name?: string;
  @Prop() value = 'on';
  /** Accessible name when there is no visible text (e.g. row selection in a table). */
  @Prop() label?: string;

  @Event() kernChange!: EventEmitter<{ checked: boolean }>;

  private initial = false;

  componentWillLoad() {
    this.initial = this.checked;
  }

  componentDidLoad() {
    this.sync();
  }

  @Watch('checked')
  sync() {
    this.internals?.setFormValue?.(this.checked ? this.value : null);
  }

  formResetCallback() {
    this.checked = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private onChange = (ev: Event) => {
    this.checked = (ev.target as HTMLInputElement).checked;
    this.indeterminate = false;
    this.kernChange.emit({ checked: this.checked });
  };

  render() {
    return (
      <Host>
        <label class="root">
          <input
            type="checkbox"
            checked={this.checked}
            indeterminate={this.indeterminate}
            disabled={this.disabled}
            aria-checked={this.indeterminate ? 'mixed' : undefined}
            aria-label={this.label}
            onChange={this.onChange}
          />
          <span class="box" part="box" aria-hidden="true" />
          <span class="text">
            <slot />
          </span>
        </label>
      </Host>
    );
  }
}
