import { Component, Host, Prop, h } from '@stencil/core';

/** Small busy indicator in the current text colour, for waits under a few seconds. */
@Component({
  tag: 'kern-spinner',
  styleUrl: 'kern-spinner.css',
  shadow: true,
})
export class KernSpinner {
  /** Diameter in px. */
  @Prop() size = 14;
  /** Accessible text; without it the spinner is decorative. */
  @Prop() label?: string;

  render() {
    return (
      <Host role={this.label ? 'status' : undefined} aria-label={this.label} aria-hidden={this.label ? undefined : 'true'}>
        <span class="ring" style={{ width: `${this.size}px`, height: `${this.size}px` }} />
      </Host>
    );
  }
}
