import { h } from '@stencil/core';

/** The few glyphs Kern draws itself (Lucide style: 16px grid, 1.5 stroke, round caps). */
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
  chevron: () => [<path d="m4.5 6.5 3.5 3.5 3.5-3.5" />],
  calendar: () => [<rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />, <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />],
  clock: () => [<circle cx="8" cy="8" r="5.75" />, <path d="M8 5v3l2 1.5" />],
  external: () => [<path d="M9.5 2.5h4v4M13.5 2.5 7.5 8.5M11.5 9.5v3c0 .6-.4 1-1 1h-7c-.6 0-1-.4-1-1v-7c0-.6.4-1 1-1h3" />],
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, class: cls }: { name: IconName; class?: string }) {
  return (
    <svg class={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {PATHS[name]()}
    </svg>
  );
}
