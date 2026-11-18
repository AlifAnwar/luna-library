import path from "node:path";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  optimizeDeps: {
    // SidebarMenuLink uses this existing Base UI subpath. Pre-optimize it so
    // Storybook browser tests do not reload midway through a fresh run.
    include: ["@withalif/luna > @base-ui/react/use-render"],
  },
  test: {
    projects: [
      {
        // Plain unit tests for the library's non-visual surface, exercised
        // through its public entry point. Component behaviour is tested through
        // the stories in the `storybook` project below.
        test: {
          name: "unit",
          include: ["tests/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              // Vitest 5 does not currently forward `browser.viewport` to the
              // Playwright context, so set the desktop-first story viewport
              // at the provider boundary where Playwright consumes it.
              contextOptions: {
                viewport: { width: 1280, height: 800 },
              },
            }),
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
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
