import { describe, expect, it } from "vitest";

import { cn } from "../../../packages/ui/src/lib/utils";

/**
 * The merge engine resolves conflicts per class group, and `text-*` spans both
 * font size and text color. Luna's named sizes have to be registered as sizes,
 * or they are mistaken for colors and one of the two is dropped.
 */
describe("cn", () => {
  const textSizes = [
    "text-caption",
    "text-label",
    "text-body-sm",
    "text-body",
    "text-body-lg",
    "text-card-title",
    "text-section",
    "text-heading-sm",
    "text-heading",
    "text-page-title",
    "text-display",
  ];

  it("keeps a type size and a text color together", () => {
    expect(cn("text-body", "text-primary-foreground")).toBe(
      "text-body text-primary-foreground",
    );
  });

  it.each(textSizes)("keeps %s alongside a text color", (size) => {
    expect(cn(size, "text-muted-foreground")).toBe(
      `${size} text-muted-foreground`,
    );
  });

  it("keeps the pairing whichever order they arrive in", () => {
    expect(cn("text-primary-foreground", "text-body")).toBe(
      "text-primary-foreground text-body",
    );
  });

  it("still lets a later type size win over an earlier one", () => {
    expect(cn("text-body", "text-label")).toBe("text-label");
    expect(cn("text-heading", "text-caption")).toBe("text-caption");
  });

  it("still lets a later text color win over an earlier one", () => {
    expect(cn("text-primary-foreground", "text-destructive")).toBe(
      "text-destructive",
    );
    expect(cn("text-muted-foreground", "text-foreground")).toBe(
      "text-foreground",
    );
  });

  it("resolves a size and a color independently in one string", () => {
    expect(
      cn("text-body text-primary-foreground", "text-label text-destructive"),
    ).toBe("text-label text-destructive");
  });

  it("leaves Tailwind's own scale alone", () => {
    expect(cn("text-sm", "text-base")).toBe("text-base");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("text-sm", "text-red-500")).toBe("text-sm text-red-500");
  });

  it("keeps ordinary conflict resolution intact", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("rounded-md", "rounded-lg")).toBe("rounded-lg");
  });

  it("treats a modifier as its own scope", () => {
    expect(cn("text-body", "hover:text-primary-foreground")).toBe(
      "text-body hover:text-primary-foreground",
    );
    expect(cn("text-body", "md:text-heading")).toBe(
      "text-body md:text-heading",
    );
    // Same size, same modifier: the later one still wins.
    expect(cn("md:text-body", "md:text-heading")).toBe("md:text-heading");
  });

  it("accepts clsx-style conditional arguments", () => {
    expect(
      cn("text-body", false && "text-label", { "text-heading": false }),
    ).toBe("text-body");
    expect(cn(["text-body", "font-medium"], { "text-foreground": true })).toBe(
      "text-body font-medium text-foreground",
    );
  });

  it("lets a consumer's className override a component's own classes", () => {
    const componentClasses = "text-body text-muted-foreground px-3";
    expect(cn(componentClasses, "text-heading text-foreground")).toBe(
      "px-3 text-heading text-foreground",
    );
  });
});
