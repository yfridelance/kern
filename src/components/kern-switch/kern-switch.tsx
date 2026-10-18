import { AttachInternals, Component, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';

/**
 * On/off switch for settings (Cloud, Bluetooth, MQTT), form-associated.
 * The label names the thing ("Cloud"), not the action.
 *
 * @slot - Label text
 * @part track - The switch track
 */
@Component({
  tag: 'kern-switch',
  styleUrl: 'kern-switch.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernSwitch {
  @AttachInternals() internals!: ElementInternals;

  @Prop({ mutable: true, reflect: true }) checked = false;
  @Prop({ reflect: true }) disabled = false;
  @Prop() name?: string;
  /** Form value when checked. */
  @Prop() value = 'on';
  /** Accessible name when there is no visible text. */
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
    this.kernChange.emit({ checked: this.checked });
  };

  render() {
    return (
      <Host>
        <label class="root">
          <input type="checkbox" role="switch" checked={this.checked} disabled={this.disabled} aria-label={this.label} onChange={this.onChange} />
          <span class="track" part="track" aria-hidden="true">
            <span class="thumb" />
          </span>
          <span class="text">
            <slot />
          </span>
        </label>
      </Host>
    );
  }
}
