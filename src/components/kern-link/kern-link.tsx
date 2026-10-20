import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { KernNavigateDetail, isPlainNavigation } from '../../utils/navigate';
import { kernTexts } from '../../utils/i18n';

/**
 * Text link for running text, table cells and cards. `external` opens a new tab (with `rel="noopener noreferrer"`)
 * and marks the link with ↗; `tone="muted"` for secondary links; `disabled` keeps the text but removes the link.
 * For actions use kern-button, also when it navigates.
 *
 * @slot - Link text
 * @part link - The native link
 */
@Component({
  tag: 'kern-link',
  styleUrl: 'kern-link.css',
  shadow: { delegatesFocus: true },
})
export class KernLink {
  @Prop() href?: string;
  @Prop() target?: string;
  /** Defaults to `noopener noreferrer` for `external` or `target="_blank"`. */
  @Prop() rel?: string;
  /** Download instead of navigate (optionally with this file name). */
  @Prop() download?: string | boolean;
  /** Opens in a new tab and shows ↗. */
  @Prop({ reflect: true }) external = false;
  /** `muted` for secondary links. */
  @Prop({ reflect: true }) tone: 'accent' | 'muted' = 'accent';
  /** Shown as text, not a link. */
  @Prop({ reflect: true }) disabled = false;
  /** Read after the text of `external` links. */
  @Prop() labelExternal?: string;
  private t = kernTexts(this, 'kern-link');

  /**
   * Plain left click (no modifier keys, `target`, `download`, `external`) before the browser navigates.
   * `preventDefault()` stops the navigation, so a SPA router can take over.
   */
  @Event({ cancelable: true }) kernNavigate!: EventEmitter<KernNavigateDetail>;

  private onClick = (ev: MouseEvent) => {
    if (this.disabled || !this.href) return;
    const target = this.external ? '_blank' : this.target;
    if (isPlainNavigation(ev, target, this.download) && this.kernNavigate.emit({ href: this.href, event: ev }).defaultPrevented) ev.preventDefault();
  };

  render() {
    const target = this.external ? '_blank' : this.target;
    const rel = this.rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);
    return (
      <Host>
        <a
          part="link"
          href={this.disabled ? undefined : this.href}
          target={this.disabled ? undefined : target}
          rel={this.disabled ? undefined : rel}
          download={this.disabled ? undefined : this.download === true || this.download === '' ? '' : this.download || undefined}
          aria-disabled={this.disabled ? 'true' : undefined}
          role={this.disabled ? 'link' : undefined}
          onClick={this.onClick}
        >
          <slot />
          {this.external && [<Icon name="external" class="external" />, <span class="sr">({this.t('labelExternal')})</span>]}
        </a>
      </Host>
    );
  }
}
