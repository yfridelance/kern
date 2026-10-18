import { Component, Host, Prop, h } from '@stencil/core';

/**
 * Page title (h1) with an optional description and the page actions on the right.
 * One `primary` button at most among the actions.
 *
 * @slot - Extra content after the heading (badge, status)
 * @slot actions - Buttons
 */
@Component({
  tag: 'kern-page-header',
  styleUrl: 'kern-page-header.css',
  shadow: true,
})
export class KernPageHeader {
  @Prop() heading!: string;
  @Prop() description?: string;

  render() {
    return (
      <Host>
        <div class="text">
          <div class="title">
            <h1>{this.heading}</h1>
            <slot />
          </div>
          {this.description && <p>{this.description}</p>}
        </div>
        <div class="actions">
          <slot name="actions" />
        </div>
      </Host>
    );
  }
}
