import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const engines = ["chromium", "firefox", "webkit"] as const;
const failureEvidenceDir = path.join(
  import.meta.dirname,
  "test-results/phase6c/narrow",
);

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
    // See vitest.phase6c.config.ts: concurrent pages make CI WebKit unreliable.
    fileParallelism: false,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        contextOptions: {
          viewport: { width: 320, height: 800 },
        },
      }),
      viewport: { width: 320, height: 800 },
      screenshotDirectory: path.join(failureEvidenceDir, "screenshots"),
      trace: {
        mode: process.env.PHASE6C_TRACE === "1" ? "retain-on-failure" : "off",
        tracesDir: path.join(failureEvidenceDir, "traces"),
      },
      instances: engines.map((browser) => ({ browser })),
    },
  },
});
