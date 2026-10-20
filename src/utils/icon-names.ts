import { BRAND_NAMES, type BrandName } from './brand-names';
import { FLAG_NAMES, type FlagName } from './flag-names';
import { GLYPH_NAMES, type GlyphName } from './icons';

/** Everything kern-icon draws: Kern's glyphs, the brand icons (`brand-…`) and the flags (`flag-…`). */
export type IconName = GlyphName | BrandName | FlagName;

/** All icon names: the glyphs, then the brand icons, then the flags. */
export const ICON_NAMES = [...GLYPH_NAMES, ...BRAND_NAMES, ...FLAG_NAMES] as IconName[];
