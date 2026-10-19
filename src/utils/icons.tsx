import { h } from '@stencil/core';

/** Kern's own glyphs (Lucide style: 16px grid, 1.5 stroke, round caps); public through kern-icon. */
// Functions, not constants: Stencil must never reuse the same JSX node in two places.
const PATHS = {
  sun: () => [<circle cx="8" cy="8" r="3" />, <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85" />],
  moon: () => [<path d="M13.5 9.6A5.5 5.5 0 0 1 6.4 2.5a5.5 5.5 0 1 0 7.1 7.1Z" />],
  copy: () => [
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />,
    <path d="M10.5 5.5V3.9c0-.8-.6-1.4-1.4-1.4H3.9c-.8 0-1.4.6-1.4 1.4v5.2c0 .8.6 1.4 1.4 1.4h1.6" />,
  ],
  check: () => [<path d="m3.5 8.5 3 3 6-7" />],
  close: () => [<path d="m4 4 8 8M12 4l-8 8" />],
  'chevron-down': () => [<path d="m4.5 6.5 3.5 3.5 3.5-3.5" />],
  'chevron-up': () => [<path d="m4.5 9.5 3.5-3.5 3.5 3.5" />],
  'chevron-left': () => [<path d="M9.5 4.5 6 8l3.5 3.5" />],
  'chevron-right': () => [<path d="M6.5 4.5 10 8l-3.5 3.5" />],
  calendar: () => [<rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />, <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />],
  clock: () => [<circle cx="8" cy="8" r="5.75" />, <path d="M8 5v3l2 1.5" />],
  minus: () => [<path d="M3.5 8h9" />],
  plus: () => [<path d="M3.5 8h9M8 3.5v9" />],
  star: () => [<path d="M8 1.9 9.9 5.8l4.2.6-3 3 .7 4.2L8 11.6l-3.8 2 .7-4.2-3-3 4.2-.6z" />],
  more: () => [<path d="M3.5 8h.01M8 8h.01M12.5 8h.01" stroke-width="2.5" />],
  menu: () => [<path d="M2.5 4h11M2.5 8h11M2.5 12h11" />],
  search: () => [<circle cx="7" cy="7" r="4.5" />, <path d="m13.5 13.5-3.3-3.3" />],
  filter: () => [<path d="M2 3h12l-4.75 5.6v4.65L6.75 14.5V8.6Z" />],
  settings: () => [<path d="M2.5 4.5h6M12.5 4.5h1M2.5 11.5h1M7.5 11.5h6" />, <circle cx="10.5" cy="4.5" r="1.75" />, <circle cx="5.5" cy="11.5" r="1.75" />],
  edit: () => [<path d="M10.6 2.7a1.5 1.5 0 0 1 2.1 2.1l-7.4 7.4-2.8.8.8-2.8Z" />],
  trash: () => [<path d="M2.5 4.5h11M6 4.5V3c0-.3.2-.5.5-.5h3c.3 0 .5.2.5.5v1.5M4 4.5l.6 8.4c.1.6.5 1.1 1.1 1.1h4.6c.6 0 1-.5 1.1-1.1l.6-8.4M6.75 7v4.5M9.25 7v4.5" />],
  refresh: () => [<path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />, <path d="M13.5 2.5v3h-3" />],
  power: () => [<path d="M8 2v5.5" />, <path d="M4.6 4.3a5.25 5.25 0 1 0 6.8 0" />],
  download: () => [<path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M2.5 13.5h11" />],
  upload: () => [<path d="M8 10.5v-8M4.5 6 8 2.5 11.5 6M2.5 13.5h11" />],
  link: () => [<path d="M6.5 9.5l3-3M7 4.5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M9 11.5l-1 1a2.5 2.5 0 0 1-3.5-3.5l1-1" />],
  lock: () => [<rect x="3" y="7" width="10" height="6.5" rx="1.5" />, <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />],
  eye: () => [<path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8Z" />, <circle cx="8" cy="8" r="2" />],
  'eye-off': () => [<path d="M6.6 3.7A6.4 6.4 0 0 1 8 3.5c4.1 0 6.5 4.5 6.5 4.5a11 11 0 0 1-1.6 2.2M4.2 4.9C2.5 6 1.5 8 1.5 8s2.4 4.5 6.5 4.5a6.5 6.5 0 0 0 3.2-.9M6.6 6.6a2 2 0 0 0 2.8 2.8M2 2l12 12" />],
  info: () => [<circle cx="8" cy="8" r="6" />, <path d="M8 7.25v3.5M8 5.25h.01" />],
  warn: () => [<path d="M7.1 2.7a1 1 0 0 1 1.8 0l5.4 9.8a1 1 0 0 1-.9 1.5H2.6a1 1 0 0 1-.9-1.5Z" />, <path d="M8 6.5v3M8 11.5h.01" />],
  wifi: () => [<path d="M1.75 6a9 9 0 0 1 12.5 0M4 8.5a5.8 5.8 0 0 1 8 0M6.25 11a2.6 2.6 0 0 1 3.5 0M8 13.25h.01" />],
  home: () => [<path d="M2.5 7 8 2.5 13.5 7v5.5c0 .6-.4 1-1 1h-9c-.6 0-1-.4-1-1Z" />, <path d="M6.5 13.5v-4h3v4" />],
  bulb: () => [<path d="M6 11.5h4M6.5 14h3M5.5 9.6A4.5 4.5 0 1 1 10.5 9.6c-.6.5-.8 1-.8 1.9H6.3c0-.9-.2-1.4-.8-1.9Z" />],
  thermometer: () => [<path d="M9.5 9.2V3a1.5 1.5 0 0 0-3 0v6.2a3 3 0 1 0 3 0Z" />],
  external: () => [<path d="M9.5 2.5h4v4M13.5 2.5 7.5 8.5M11.5 9.5v3c0 .6-.4 1-1 1h-7c-.6 0-1-.4-1-1v-7c0-.6.4-1 1-1h3" />],
};

export type GlyphName = keyof typeof PATHS;

/** Kern's own glyph names (brand icons: see brands.ts; all names: icon-names.ts). */
export const GLYPH_NAMES = Object.keys(PATHS) as GlyphName[];

/** A glyph inside a component. Brand icons are only drawn by kern-icon, so their data stays out of other components. */
export function Icon({ name, class: cls }: { name: GlyphName; class?: string }) {
  return (
    <svg class={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {PATHS[name]?.()}
    </svg>
  );
}
