import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { kernTexts } from '../../utils/i18n';

/**
 * App header: brand on the left, main navigation, tools on the right (site switch, server status,
 * kern-theme-toggle). Put each nav link directly into the `nav` slot; the active one gets
 * `aria-current="page"` or class `active` (e.g. Angular `routerLinkActive="active"`).
 *
 * `menu` adds a menu button before the brand that emits `kernMenu`, e.g. to open a side navigation on small screens;
 * kern-app-shell sets it itself.
 *
 * @slot brand - Replaces the default brand (mark + `app-name`)
 * @slot nav - `<a>` elements of the main navigation (at most six)
 * @slot end - Tools, right-aligned
 * @part bar - The header bar
 * @part menu - The menu button
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
  @Prop() navLabel?: string;
  /** Shows a menu button before the brand. */
  @Prop({ reflect: true }) menu = false;
  /** Whether the menu the button opens is open (`aria-expanded`). */
  @Prop() menuExpanded = false;
  /** Accessible name of the menu button. */
  @Prop() labelMenu?: string;
  private t = kernTexts(this, 'kern-topbar');

  /** The menu button was clicked. */
  @Event() kernMenu!: EventEmitter<{ expanded: boolean }>;

  render() {
    return (
      <Host>
        <header part="bar">
          {this.menu && (
            <button
              type="button"
              class="menu"
              part="menu"
              aria-label={this.t('labelMenu')}
              title={this.t('labelMenu')}
              aria-expanded={this.menuExpanded ? 'true' : 'false'}
              onClick={() => this.kernMenu.emit({ expanded: !this.menuExpanded })}
            >
              <Icon name="menu" />
            </button>
          )}
          <slot name="brand">
            <a class="brand" href={this.homeHref}>
              <span class="mark" aria-hidden="true" />
              {this.suite && <span class="suite">{this.suite} /</span>}
              {this.appName}
            </a>
          </slot>
          <nav aria-label={this.t('navLabel')}>
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
