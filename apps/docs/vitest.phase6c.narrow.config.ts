import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const engines = ["chromium", "firefox", "webkit"] as const;

export default defineConfig({
  optimizeDeps: {
    include: ["@withalif/luna > @base-ui/react/use-render"],
  },
  plugins: [
    storybookTest({
      configDir: path.join(import.meta.dirname, ".storybook"),
      tags: { include: ["phase6c-narrow"] },
    }),
  ],
  test: {
    name: "phase6c-narrow",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        contextOptions: {
          viewport: { width: 320, height: 800 },
        },
      }),
      viewport: { width: 320, height: 800 },
      instances: engines.map((browser) => ({ browser })),
    },
  },
});
