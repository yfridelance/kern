import { Component, Host, Prop, h } from '@stencil/core';

/**
 * One view inside kern-tabs. `label` is the tab text, `name` the value kern-tabs selects by,
 * `count` an optional number shown as badge.
 *
 * @slot - Panel content
 */
@Component({
  tag: 'kern-tab-panel',
  styleUrl: 'kern-tab-panel.css',
  shadow: true,
})
export class KernTabPanel {
  @Prop({ reflect: true }) label!: string;
  @Prop({ reflect: true }) name?: string;
  @Prop({ reflect: true }) count?: string;
  /** Set by kern-tabs. */
  @Prop({ reflect: true }) active = false;

  render() {
    return (
      <Host role="tabpanel" aria-label={this.label} hidden={!this.active}>
        <slot />
      </Host>
    );
  }
}
