import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = JSON.parse(
  readFileSync(
    new URL("../../../packages/ui/package.json", import.meta.url),
    "utf8",
  ),
) as {
  exports: Record<string, unknown>;
};
const runtimeStyles = readFileSync(
  new URL("../../../packages/ui/src/styles/globals.css", import.meta.url),
  "utf8",
);
const theme = readFileSync(
  new URL("../../../packages/ui/src/styles/theme.css", import.meta.url),
  "utf8",
);
const storybookStyles = readFileSync(
  new URL("../.storybook/preview.css", import.meta.url),
  "utf8",
);

describe("Tailwind theme authoring contract", () => {
  it("exports compiler metadata separately from runtime styles", () => {
    expect(packageJson.exports["./styles.css"]).toBe("./dist/styles.css");
    expect(packageJson.exports["./theme.css"]).toBe("./dist/theme.css");
  });

  it("keeps one source of Luna namespace mappings", () => {
    expect(theme).toContain("@theme inline");
    expect(theme).toContain("--color-background: var(--background)");
    expect(theme).toContain("--color-chart-5: var(--chart-5)");
    expect(theme).not.toContain("--color-luna-blue-");
    expect(theme).not.toContain("@source");

    expect(runtimeStyles).toContain('@reference "./theme.css"');
    expect(runtimeStyles).not.toContain("@theme inline");
  });

  it("keeps Storybook on public package paths", () => {
    expect(storybookStyles).toContain('@reference "tailwindcss/theme.css"');
    expect(storybookStyles).toContain('@reference "@withalif/luna/theme.css"');
    expect(storybookStyles).toContain(
      '@source "../node_modules/@withalif/luna/dist/components"',
    );
    expect(storybookStyles).not.toContain("packages/ui/src");
  });

  it("keeps default breakpoints available to Storybook-authored utilities", () => {
    expect(storybookStyles).toContain(
      '@import "tailwindcss/utilities.css" layer(utilities) source(none)',
    );
    expect(storybookStyles).toContain('@source "../stories"');
    expect(
      storybookStyles.indexOf('@reference "tailwindcss/theme.css"'),
    ).toBeLessThan(storybookStyles.indexOf('@source "../stories"'));
  });
});
