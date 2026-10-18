import { Component, Host, Prop, h } from '@stencil/core';

/**
 * App header: brand on the left, main navigation, tools on the right (site switch, server status,
 * kern-theme-toggle). Put each nav link directly into the `nav` slot; the active one gets
 * `aria-current="page"` or class `active` (e.g. Angular `routerLinkActive="active"`).
 *
 * @slot brand - Replaces the default brand (mark + `app-name`)
 * @slot nav - `<a>` elements of the main navigation (at most six)
 * @slot end - Tools, right-aligned
 * @part bar - The header bar
 */
@Component({
  tag: 'kern-topbar',
  styleUrl: 'kern-topbar.css',
  shadow: true,
})
export class KernTopbar {
  @Prop() appName?: string;
  /** Muted product family before the app name, e.g. "Homelab". */
  @Prop() suite?: string;
  /** Link of the brand. */
  @Prop() homeHref = '/';
  /** Accessible name of the navigation. */
  @Prop() navLabel = 'Hauptnavigation';

  render() {
    return (
      <Host>
        <header part="bar">
          <slot name="brand">
            <a class="brand" href={this.homeHref}>
              <span class="mark" aria-hidden="true" />
              {this.suite && <span class="suite">{this.suite} /</span>}
              {this.appName}
            </a>
          </slot>
          <nav aria-label={this.navLabel}>
            <slot name="nav" />
          </nav>
          <div class="end">
            <slot name="end" />
          </div>
        </header>
      </Host>
    );
  }
}
