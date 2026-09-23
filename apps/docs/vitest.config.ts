import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            // Vitest's browser default is a phone-sized 414x896 viewport, which
            // puts every story below Luna's `md` breakpoint. Luna is an
            // enterprise UI library and its stories are authored desktop-first,
            // so run them that way; stories that are specifically about
            // narrow-viewport behaviour should drive their own size.
            //
            // This is deliberately project-wide because per-story scoping is not
            // available here: the Vitest runner does not apply Storybook's
            // `parameters.viewport`, and importing `@vitest/browser/context`
            // from a story file breaks that file's module resolution under
            // Storybook's builder.
            viewport: { width: 1280, height: 800 },
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
