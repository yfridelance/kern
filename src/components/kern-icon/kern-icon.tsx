import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import type { BrandName } from '../../utils/brand-names';
import type { FlagName } from '../../utils/flag-names';
import { FLAGS, type Flag } from '../../utils/flags';
import { Icon, type GlyphName } from '../../utils/icons';
import type { IconName } from '../../utils/icon-names';

type Brand = { hex: string; path: string };
let brands: Promise<Record<BrandName, Brand>> | undefined;
/** The brand paths (~60 KB) load once, the first time a brand icon is shown; glyphs never need them. */
const loadBrands = () => (brands ??= import('../../utils/brands').then((m) => m.BRANDS));

/**
 * One of Kern's glyphs (Lucide style), a brand icon (`brand-github`, `brand-home-assistant` …, from Simple Icons) or a
 * country flag (`flag-ch`, `flag-gb` …, from flag-icons). Sized by `font-size` (1em high) and coloured by
 * `currentColor`, so it fits text and buttons; `brand-color` shows a brand icon in its official colour, flags are
 * always in colour and 4:3. Decorative without `label`; with `label` it is announced as an image.
 */
@Component({
  tag: 'kern-icon',
  styleUrl: 'kern-icon.css',
  shadow: true,
})
export class KernIcon {
  /** Glyph name, e.g. `wifi`, `power`, `refresh`, a brand icon, e.g. `brand-github`, or a flag, e.g. `flag-ch`. */
  @Prop({ reflect: true }) name!: IconName;
  /** Accessible name; without it the icon is decorative. */
  @Prop() label?: string;
  /** Brand icons in their official colour instead of `currentColor` (check the contrast: some are near-black or white). */
  @Prop({ reflect: true }) brandColor = false;

  @State() brand?: Brand;
  @State() flag?: Flag;

  componentWillLoad() {
    return this.load();
  }

  @Watch('name')
  load(): Promise<void> | void {
    const name = this.name;
    this.brand = undefined;
    this.flag = undefined;
    if (name?.startsWith('flag-')) {
      // Each flag is its own module, so only the shown ones load.
      return FLAGS[name as FlagName]?.().then((flag) => {
        if (this.name === name) this.flag = flag;
      });
    }
    if (!name?.startsWith('brand-')) return;
    return loadBrands().then((all) => {
      if (this.name === name) this.brand = all[name as BrandName];
    });
  }

  private glyph() {
    const brand = this.brand;
    if (this.name.startsWith('flag-')) {
      const flag = this.flag;
      // innerHTML on an HTML wrapper: Stencil sets it as an attribute on SVG elements.
      const svg = `<svg viewBox="${flag?.viewBox ?? '0 0 640 480'}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${flag?.body ?? ''}</svg>`;
      return <span class="flag" innerHTML={svg} />;
    }
    if (!this.name.startsWith('brand-')) return <Icon name={this.name as GlyphName} />;
    if (!brand) return <svg viewBox="0 0 24 24" aria-hidden="true" />;
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
