import { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';

export const config: Config = {
  namespace: 'kern',
  // Tokens, theme switch, base styles and the light-DOM parts (kern-table) for the whole page.
  globalStyle: 'src/global/kern.css',
  // Without a hint Stencil bundles every component used in src/index.html (the demo page, i.e. all of them)
  // into one lazy entry. An empty hint keeps one entry per component (plus its JSX dependencies).
  entryComponentsHint: [],
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    // Standalone Angular wrappers (incl. ControlValueAccessors) as source; the app compiles them.
    angularOutputTarget({
      componentCorePackage: '@yfridelance/kern',
      outputType: 'standalone',
      directivesProxyFile: 'angular/src/directives/proxies.ts',
      directivesArrayFile: 'angular/src/directives/index.ts',
      valueAccessorConfigs: [
        {
          elementSelectors: ['kern-input', 'kern-textarea', 'kern-select', 'kern-segmented', 'kern-date-picker', 'kern-time-picker', 'kern-date-range-picker', 'kern-ip-input', 'kern-mac-input', 'kern-radio-group', 'kern-range', 'kern-color-picker'],
          event: 'kernChange',
          targetAttr: 'value',
          type: 'text',
        },
        {
          elementSelectors: ['kern-rating', 'kern-step-input'],
          event: 'kernChange',
          targetAttr: 'value',
          type: 'number',
        },
        {
          elementSelectors: ['kern-switch', 'kern-checkbox'],
          event: 'kernChange',
          targetAttr: 'checked',
          type: 'boolean',
        },
      ],
    }),
    { type: 'docs-readme', footer: '' },
    { type: 'docs-json', file: 'dist/docs.json' },
    { type: 'www', serviceWorker: null },
  ],
  testing: {
    browserHeadless: 'shell',
    // Agent worktrees live in .claude/worktrees inside the repo; their copies must not run with ours.
    // e2e/ holds the Playwright browser tests (npm run e2e).
    testPathIgnorePatterns: ['/node_modules/', '/\\.claude/', '/e2e/'],
    modulePathIgnorePatterns: ['/\\.claude/'],
  },
};
