import { Component, Element, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

/**
 * One option of kern-radio-group: a round marker with label and optional description. The group sets `checked` and
 * the tab stop; use it only inside kern-radio-group.
 *
 * @slot - Label (instead of `label`)
 * @slot description - Second line (instead of `description`)
 * @part control - The round marker
 */
@Component({
  tag: 'kern-radio',
  styleUrl: 'kern-radio.css',
  shadow: true,
})
export class KernRadio {
  @Element() el!: HTMLElement;

  @Prop({ reflect: true }) value = '';
  @Prop() label?: string;
  @Prop() description?: string;
  @Prop({ reflect: true }) disabled = false;
  /** Set by kern-radio-group. */
  @Prop({ mutable: true, reflect: true }) checked = false;

  /** Asks the group to select this option (internal). */
  @Event({ bubbles: true, composed: true }) kernRadioSelect!: EventEmitter<{ value: string }>;

  private select = () => {
    if (!this.disabled) this.kernRadioSelect.emit({ value: this.value });
  };

  private onKey = (ev: KeyboardEvent) => {
    if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      this.select();
    }
  };

  render() {
    return (
      // Inline style: the page's global :focus-visible ring would beat :host rules; the marker shows the focus instead.
      <Host style={{ outline: 'none' }} role="radio" aria-checked={this.checked ? 'true' : 'false'} aria-disabled={this.disabled ? 'true' : undefined} onClick={this.select} onKeyDown={this.onKey}>
        <span class="control" part="control" />
        <span class="text">
          <span class="label">
            {this.label}
            <slot />
          </span>
          <span class="description">
            {this.description}
            <slot name="description" />
          </span>
        </span>
      </Host>
    );
  }
}
