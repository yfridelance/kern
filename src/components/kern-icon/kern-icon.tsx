import { Component, Host, Prop, h } from '@stencil/core';
import { Icon, type IconName } from '../../utils/icons';

/**
 * One of Kern's glyphs (Lucide style). Sized by `font-size` (1em) and coloured by `currentColor`, so it fits text and
 * buttons. Decorative without `label`; with `label` it is announced as an image. Names: see the README.
 */
@Component({
  tag: 'kern-icon',
  styleUrl: 'kern-icon.css',
  shadow: true,
})
export class KernIcon {
  /** Glyph name, e.g. `wifi`, `power`, `refresh`. */
  @Prop({ reflect: true }) name!: IconName;
  /** Accessible name; without it the icon is decorative. */
  @Prop() label?: string;

  render() {
    return (
      <Host role={this.label ? 'img' : undefined} aria-label={this.label} aria-hidden={this.label ? undefined : 'true'}>
        {this.name && <Icon name={this.name} />}
      </Host>
    );
  }
}
