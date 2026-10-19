import { Component, Host, Prop, h } from '@stencil/core';
import { BRANDS } from '../../utils/brands';
import { Icon, type GlyphName } from '../../utils/icons';
import type { IconName } from '../../utils/icon-names';

/**
 * One of Kern's glyphs (Lucide style) or a brand icon (`brand-github`, `brand-home-assistant` …, from Simple Icons).
 * Sized by `font-size` (1em) and coloured by `currentColor`, so it fits text and buttons; `brand-color` shows a brand
 * icon in its official colour. Decorative without `label`; with `label` it is announced as an image.
 */
@Component({
  tag: 'kern-icon',
  styleUrl: 'kern-icon.css',
  shadow: true,
})
export class KernIcon {
  /** Glyph name, e.g. `wifi`, `power`, `refresh`, or a brand icon, e.g. `brand-github`. */
  @Prop({ reflect: true }) name!: IconName;
  /** Accessible name; without it the icon is decorative. */
  @Prop() label?: string;
  /** Brand icons in their official colour instead of `currentColor` (check the contrast: some are near-black or white). */
  @Prop({ reflect: true }) brandColor = false;

  private glyph() {
    const brand = BRANDS[this.name as keyof typeof BRANDS];
    if (!brand) return <Icon name={this.name as GlyphName} />;
    return (
      <svg viewBox="0 0 24 24" fill={this.brandColor ? brand.hex : 'currentColor'} aria-hidden="true">
        <path d={brand.path} />
      </svg>
    );
  }

  render() {
    return (
      <Host role={this.label ? 'img' : undefined} aria-label={this.label} aria-hidden={this.label ? undefined : 'true'}>
        {this.name && this.glyph()}
      </Host>
    );
  }
}
