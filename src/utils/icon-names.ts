import { BRAND_NAMES, type BrandName } from './brand-names';
import { GLYPH_NAMES, type GlyphName } from './icons';

/** Everything kern-icon draws: Kern's glyphs and the brand icons (`brand-…`). */
export type IconName = GlyphName | BrandName;

/** All icon names: the glyphs, then the brand icons. */
export const ICON_NAMES = [...GLYPH_NAMES, ...BRAND_NAMES] as IconName[];
