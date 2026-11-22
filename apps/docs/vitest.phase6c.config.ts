import path from "node:path";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

import { resolvePhase6cEngines } from "./phase6c-engines";

const engines = resolvePhase6cEngines();
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
      // Playwright traces are opt-in (PHASE6C_TRACE=1) because recording
      // every test slows the browsers enough to make the suite flaky.
      screenshotDirectory: path.join(failureEvidenceDir, "screenshots"),
      trace: {
        mode: process.env.PHASE6C_TRACE === "1" ? "retain-on-failure" : "off",
        tracesDir: path.join(failureEvidenceDir, "traces"),
      },
      instances: engines.map((browser) => ({ browser })),
    },
  },
});
