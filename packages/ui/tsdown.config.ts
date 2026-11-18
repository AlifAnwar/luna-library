import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    styles: "src/styles/globals.css",
  },
  platform: "neutral",
  target: "es2022",
  format: "esm",
  outDir: "dist",
  root: "src",
  unbundle: true,
  clean: true,
  minify: false,
  sourcemap: true,
  dts: false,
  onSuccess: "tsc -p tsconfig.build.json && node scripts/copy-theme.mjs",
  deps: {
    neverBundle: true,
    onlyImport: [
      "@base-ui/react",
      "@daypicker/react",
      "class-variance-authority",
      "cn",
      "react",
      "react-dom",
      "recharts",
    ],
  },
  css: {
    transformer: "postcss",
    postcss: ".",
    splitting: false,
    fileName: "styles.css",
    modules: false,
    minify: false,
  },
  // Rolldown emits this generic warning even in unbundle mode. Every source
  // module is emitted separately below, and the build validation verifies that
  // all existing React client directives survive in dist/.
  suppressWarnings: "MODULE_LEVEL_DIRECTIVE",
  failOnWarn: true,
  report: {
    summary: true,
  },
});
