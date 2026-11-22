import path from "node:path";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const engines = ["chromium", "firefox", "webkit"] as const;

export default defineConfig({
  optimizeDeps: {
    include: ["@withalif/luna > @base-ui/react/use-render"],
  },
  plugins: [
    storybookTest({
      configDir: path.join(import.meta.dirname, ".storybook"),
      tags: { include: ["phase6c-reference"] },
    }),
  ],
  test: {
    name: "phase6c-reference",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        contextOptions: {
          viewport: { width: 1280, height: 800 },
        },
      }),
      viewport: { width: 1280, height: 800 },
      instances: engines.map((browser) => ({ browser })),
    },
  },
});
