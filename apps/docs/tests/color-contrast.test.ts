import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync(
  new URL("../../../packages/ui/src/styles/globals.css", import.meta.url),
  "utf8",
);

function token(name: string): string {
  const match = styles.match(new RegExp(`--${name}:\\s*([^;]+);`));

  if (!match?.[1]) {
    throw new Error(`Expected --${name} to be declared`);
  }

  const value = match[1].trim();
  const reference = value.match(/^var\(--([a-z0-9-]+)\)$/i)?.[1];

  if (reference) {
    return token(reference);
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`Expected --${name} to resolve to a six-digit hex color`);
  }

  return value;
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

describe("danger semantic contrast", () => {
  const danger = token("danger");
  const surfaces = [
    token("surface"),
    token("surface-subtle"),
    token("surface-muted"),
    token("background"),
  ];

  it.each([
    ["surface", token("surface")],
    ["subtle status surface", token("danger-subtle")],
    ["page background", token("background")],
  ])("keeps danger text AA against the %s", (_, background) => {
    expect(contrast(danger, background)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps inverse text AA on a solid danger fill", () => {
    expect(
      contrast(token("destructive-foreground"), danger),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps secondary alert copy AA on the danger status surface", () => {
    expect(
      contrast(token("foreground-secondary"), token("danger-subtle")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each([0.1, 0.2])(
    "keeps destructive button text AA on a %d alpha tint across Luna surfaces",
    (alpha) => {
      for (const surface of surfaces) {
        expect(
          contrast(danger, composite(danger, surface, alpha)),
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
});

describe("chart legend marker contrast", () => {
  it("keeps the shape outline distinguishable on Luna surfaces", () => {
    expect(
      contrast(token("foreground-secondary"), token("surface")),
    ).toBeGreaterThanOrEqual(3);
  });

  it.each(["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"])(
    "keeps %s graphical marks distinguishable on the chart surface",
    (chartToken) => {
      expect(
        contrast(token(chartToken), token("surface")),
      ).toBeGreaterThanOrEqual(3);
    },
  );
});
