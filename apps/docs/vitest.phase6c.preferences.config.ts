import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

function preferenceProject(
  name: string,
  contextOptions: { forcedColors?: "active"; reducedMotion?: "reduce" },
) {
  return {
    plugins: [
      storybookTest({
        configDir: path.join(import.meta.dirname, ".storybook"),
        tags: { include: ["phase6c-reference"] },
      }),
    ],
    test: {
      name,
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({
          contextOptions: {
            ...contextOptions,
            viewport: { width: 1280, height: 800 },
          },
        }),
        viewport: { width: 1280, height: 800 },
        instances: [{ browser: "chromium" as const }],
      },
    },
  };
}

export default defineConfig({
  optimizeDeps: {
    include: ["@withalif/luna > @base-ui/react/use-render"],
  },
  test: {
    projects: [
      preferenceProject("phase6c-forced-colors", { forcedColors: "active" }),
      preferenceProject("phase6c-reduced-motion", {
        reducedMotion: "reduce",
      }),
    ],
  },
});
