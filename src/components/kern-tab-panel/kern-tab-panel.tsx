import { Component, Element, Host, Prop, Watch, h } from '@stencil/core';

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
  @Element() el!: HTMLElement;

  @Prop({ reflect: true }) label!: string;
  @Prop({ reflect: true }) name?: string;
  @Prop({ reflect: true }) count?: string;
  /** Set by kern-tabs. */
  @Prop({ reflect: true }) active = false;

  /** Tells kern-tabs to rebuild its tabs (internal event, not part of the API). */
  @Watch('label')
  @Watch('name')
  @Watch('count')
  changed() {
    this.el.dispatchEvent(new CustomEvent('kern-tab-panel-change', { bubbles: true }));
  }

  render() {
    return (
      <Host role="tabpanel" aria-label={this.label} hidden={!this.active}>
        <slot />
      </Host>
    );
  }
}
