import { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';

export const config: Config = {
  namespace: 'kern',
  // Tokens, theme switch, base styles and the light-DOM parts (kern-table) for the whole page.
  globalStyle: 'src/global/kern.css',
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
          elementSelectors: ['kern-input', 'kern-textarea', 'kern-select', 'kern-segmented', 'kern-date-picker', 'kern-time-picker', 'kern-date-range-picker', 'kern-ip-input'],
          event: 'kernChange',
          targetAttr: 'value',
          type: 'text',
        },
        {
          elementSelectors: ['kern-rating'],
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
  },
};
