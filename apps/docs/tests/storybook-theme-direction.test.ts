import { describe, expect, it } from "vitest";

import {
  applyDocumentPreferences,
  resolveDirection,
  resolveTheme,
  shouldApplyDocumentPreferences,
} from "../.storybook/theme-direction";

function createAttributeRoot(initial: Record<string, string> = {}) {
  const attributes = new Map(Object.entries(initial));

  return {
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
    removeAttribute(name: string) {
      attributes.delete(name);
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
  };
}

describe("Storybook theme and direction globals", () => {
  it("accepts only Luna's public theme and direction names", () => {
    expect(resolveTheme("dark")).toBe("dark");
    expect(resolveTheme("sepia")).toBe("light");
    expect(resolveDirection("rtl")).toBe("rtl");
    expect(resolveDirection("auto")).toBe("ltr");
  });

  it("keeps Docs neutral while allowing isolated story previews to own the document root", () => {
    expect(shouldApplyDocumentPreferences("docs")).toBe(false);
    expect(shouldApplyDocumentPreferences("story")).toBe(true);
    expect(shouldApplyDocumentPreferences(undefined)).toBe(true);
  });

  it("applies the selected values and removes attributes absent before mount", () => {
    const root = createAttributeRoot();
    const restore = applyDocumentPreferences(root, {
      theme: "dark",
      direction: "rtl",
    });

    expect(root.getAttribute("data-theme")).toBe("dark");
    expect(root.getAttribute("dir")).toBe("rtl");

    restore();

    expect(root.getAttribute("data-theme")).toBeNull();
    expect(root.getAttribute("dir")).toBeNull();
  });

  it("restores document attributes that existed before the decorator mounted", () => {
    const root = createAttributeRoot({
      "data-theme": "host-theme",
      dir: "auto",
    });
    const restore = applyDocumentPreferences(root, {
      theme: "light",
      direction: "ltr",
    });

    restore();

    expect(root.getAttribute("data-theme")).toBe("host-theme");
    expect(root.getAttribute("dir")).toBe("auto");
  });
});
