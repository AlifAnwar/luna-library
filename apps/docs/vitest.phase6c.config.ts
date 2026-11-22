import path from "node:path";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const engines = ["chromium", "firefox", "webkit"] as const;
const failureEvidenceDir = path.join(
  import.meta.dirname,
  "test-results/phase6c/reference",
);

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
      // Keep Playwright traces and screenshots only for failed tests so CI
      // failures in engines that cannot run locally (Linux WebKit) can be
      // inspected from the uploaded workflow artifact.
      screenshotDirectory: path.join(failureEvidenceDir, "screenshots"),
      trace: {
        mode: "retain-on-failure",
        tracesDir: path.join(failureEvidenceDir, "traces"),
      },
      instances: engines.map((browser) => ({ browser })),
    },
  },
});
