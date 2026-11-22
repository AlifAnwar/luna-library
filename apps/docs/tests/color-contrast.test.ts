import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postcss, { type Rule } from "postcss";
import { describe, expect, it } from "vitest";

const styles = readFileSync(
  new URL("../../../packages/ui/src/styles/globals.css", import.meta.url),
  "utf8",
);
const stylesheet = postcss.parse(styles);

type Theme = "light" | "dark";

const publicColorTokens = [
  "background",
  "surface",
  "surface-subtle",
  "surface-muted",
  "card",
  "popover",
  "foreground",
  "foreground-secondary",
  "foreground-muted",
  "card-foreground",
  "popover-foreground",
  "primary",
  "primary-hover",
  "primary-active",
  "primary-subtle",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "border-subtle",
  "input",
  "ring",
  "success",
  "success-subtle",
  "success-border",
  "success-foreground",
  "warning",
  "warning-subtle",
  "warning-border",
  "danger",
  "danger-subtle",
  "danger-border",
  "info",
  "info-subtle",
  "info-border",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-outline",
  "chart-1-foreground",
  "chart-2-foreground",
  "chart-3-foreground",
  "chart-4-foreground",
  "chart-5-foreground",
] as const;

function themeRule(selector: string): Rule {
  const rule = stylesheet.nodes.find(
    (node): node is Rule =>
      node.type === "rule" && node.selectors.includes(selector),
  );

  if (!rule) {
    throw new Error(`Expected a top-level ${selector} theme rule`);
  }

  return rule;
}

function declarations(rule: Rule): Map<string, string> {
  const result = new Map<string, string>();

  rule.walkDecls((declaration) => {
    result.set(declaration.prop, declaration.value.trim());
  });

  return result;
}

function themeDeclarations(theme: Theme): Map<string, string> {
  const result = declarations(themeRule(":root"));

  for (const [property, value] of declarations(
    themeRule(`[data-theme="${theme}"]`),
  )) {
    result.set(property, value);
  }

  return result;
}

function token(theme: Theme, name: string): string {
  const values = themeDeclarations(theme);
  const seen = new Set<string>();

  function resolve(tokenName: string): string {
    if (seen.has(tokenName)) {
      throw new Error(`Circular color token reference at --${tokenName}`);
    }

    seen.add(tokenName);
    const value = values.get(`--${tokenName}`);

    if (!value) {
      throw new Error(`Expected --${tokenName} to be declared for ${theme}`);
    }

    const reference = value.match(/^var\(--([a-z0-9-]+)\)$/i)?.[1];

    if (reference) {
      return resolve(reference);
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
      throw new Error(
        `Expected --${tokenName} to resolve to a six-digit hex color for ${theme}`,
      );
    }

    return value.toLowerCase();
  }

  return resolve(name);
}

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((index) =>
    Number.parseInt(hex.slice(index, index + 2), 16),
  ) as [number, number, number];
}

function luminance(hex: string): number {
  const channels = rgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrast(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

function composite(
  foreground: string,
  background: string,
  alpha: number,
): string {
  const backgroundChannels = rgb(background);
  const channels = rgb(foreground).map((channel, index) =>
    Math.round(channel * alpha + backgroundChannels[index]! * (1 - alpha)),
  );

  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function componentFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const url = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directory,
    );

    if (entry.isDirectory()) {
      return componentFiles(url);
    }

    return entry.isFile() && entry.name.endsWith(".tsx") ? [url] : [];
  });
}

describe("public theme contract", () => {
  it("declares the light fallback and both public theme selectors", () => {
    const rootRule = themeRule(":root");
    const lightRule = themeRule('[data-theme="light"]');
    const darkRule = themeRule('[data-theme="dark"]');

    expect(lightRule).toBe(rootRule);
    expect(declarations(rootRule).get("color-scheme")).toBe("light");
    expect(declarations(darkRule).get("color-scheme")).toBe("dark");
    expect(styles).not.toContain("prefers-color-scheme");
  });

  it.each([
    ["light", ':root, [data-theme="light"]'],
    ["dark", '[data-theme="dark"]'],
  ] as const)(
    "declares every supported semantic token in %s",
    (_, selector) => {
      const rule = selector.startsWith(":root")
        ? themeRule(":root")
        : themeRule(selector);
      const values = declarations(rule);

      for (const name of publicColorTokens) {
        expect(
          values.has(`--${name}`),
          `Missing --${name} in ${selector}`,
        ).toBe(true);
      }
    },
  );

  it("keeps component colors semantic and independent of Tailwind dark variants", () => {
    const root = new URL(
      "../../../packages/ui/src/components/",
      import.meta.url,
    );
    const literalUtility =
      /\b(?:bg|border|fill|outline|ring|stroke|text)-(?:black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-|\/|\b)/;
    const rawColor = /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch)\(/i;

    for (const file of componentFiles(root)) {
      const source = readFileSync(file, "utf8");
      const path = fileURLToPath(file);

      expect(source, `${path} contains a dark: theme branch`).not.toMatch(
        /(?:^|\s)dark:/,
      );
      expect(source, `${path} contains a raw named color utility`).not.toMatch(
        literalUtility,
      );
      expect(source, `${path} contains a raw color literal`).not.toMatch(
        rawColor,
      );
    }
  });
});

describe.each(["light", "dark"] as const)("%s theme contrast", (theme) => {
  const surfaces = [
    "background",
    "surface",
    "surface-subtle",
    "surface-muted",
  ] as const;

  it.each([
    ["foreground", "background"],
    ["foreground", "surface"],
    ["foreground-secondary", "surface"],
    ["secondary-foreground", "secondary"],
    ["primary-foreground", "primary"],
    ["primary-active", "primary-subtle"],
    ["danger", "danger-subtle"],
    ["info", "info-subtle"],
  ] as const)("keeps %s AA against %s", (foreground, background) => {
    expect(
      contrast(token(theme, foreground), token(theme, background)),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["success", "success-subtle"],
    ["warning", "warning-subtle"],
  ] as const)("keeps the %s icon visible on %s", (foreground, background) => {
    expect(
      contrast(token(theme, foreground), token(theme, background)),
    ).toBeGreaterThanOrEqual(3);
  });

  it.each([
    "success-subtle",
    "warning-subtle",
    "danger-subtle",
    "info-subtle",
  ] as const)("keeps supporting copy AA on %s", (background) => {
    expect(
      contrast(token(theme, "foreground-secondary"), token(theme, background)),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(surfaces)(
    "keeps active input boundaries visible on %s",
    (surface) => {
      expect(
        contrast(token(theme, "input"), token(theme, surface)),
      ).toBeGreaterThanOrEqual(3);
    },
  );

  it.each(surfaces)(
    "keeps solid and 50%% focus rings visible on %s",
    (surface) => {
      const background = token(theme, surface);
      const ring = token(theme, "ring");

      expect(contrast(ring, background)).toBeGreaterThanOrEqual(3);
      expect(
        contrast(composite(ring, background, 0.5), background),
      ).toBeGreaterThanOrEqual(3);
    },
  );

  it("keeps inverse content visible on solid status fills", () => {
    expect(
      contrast(token(theme, "success-foreground"), token(theme, "success")),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrast(token(theme, "destructive-foreground"), token(theme, "danger")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each([0.1, 0.2])(
    "keeps destructive button text AA on a %d alpha tint across Luna surfaces",
    (alpha) => {
      for (const surface of surfaces) {
        const background = token(theme, surface);
        const danger = token(theme, "danger");

        expect(
          contrast(danger, composite(danger, background, alpha)),
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it.each(surfaces)("keeps the chart outline visible on %s", (surface) => {
    expect(
      contrast(token(theme, "chart-outline"), token(theme, surface)),
    ).toBeGreaterThanOrEqual(3);
  });

  it.each(["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"])(
    "keeps slice labels readable on %s with its paired foreground",
    (chartToken) => {
      expect(
        contrast(
          token(theme, `${chartToken}-foreground`),
          token(theme, chartToken),
        ),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );
});

describe("chart palette contract", () => {
  it.each([
    ["chart-1", "#0077ff"],
    ["chart-2", "#009dff"],
    ["chart-3", "#00bfff"],
    ["chart-4", "#66d9ff"],
    ["chart-5", "#eaf7ff"],
  ])("keeps %s aligned with the sky palette", (chartToken, expected) => {
    expect(token("light", chartToken)).toBe(expected);
    expect(token("dark", chartToken)).toBe(expected);
  });
});
