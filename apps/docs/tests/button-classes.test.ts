import { describe, expect, it } from "vitest";

import { buttonVariants } from "@withalif/luna";
import { cn } from "../../../packages/ui/src/lib/utils";

/**
 * `cva` concatenates without resolving conflicts; Button merges the result
 * through `cn` before it reaches the DOM, so that is the layer asserted here.
 *
 * The size variants set a type size and the colour variants set a text colour,
 * and both land in the same class string. Guards the regression where the merge
 * engine read `text-label` / `text-caption` as colours and dropped
 * `text-primary-foreground`, leaving small buttons below the WCAG AA contrast
 * floor. See `packages/ui/src/lib/utils.ts`.
 */
describe("Button classes", () => {
  const rendered = (size: "default" | "xs" | "sm" | "lg", className?: string) =>
    cn(buttonVariants({ variant: "default", size, className })).split(" ");

  it.each(["default", "xs", "sm", "lg"] as const)(
    "keeps the foreground colour on the default variant at size %s",
    (size) => {
      expect(rendered(size)).toContain("text-primary-foreground");
    },
  );

  it.each([
    ["default", "text-body"],
    ["sm", "text-label"],
    ["xs", "text-caption"],
  ] as const)("keeps the %s size's own type token", (size, token) => {
    const classes = rendered(size);

    expect(classes).toContain(token);
    expect(classes).toContain("text-primary-foreground");
    // Exactly one type size survives the merge.
    expect(
      classes.filter((c) =>
        ["text-body", "text-label", "text-caption"].includes(c),
      ),
    ).toEqual([token]);
  });

  it("still lets a caller override the foreground colour", () => {
    const classes = rendered("sm", "text-destructive");

    expect(classes).toContain("text-destructive");
    expect(classes).not.toContain("text-primary-foreground");
    // Overriding the colour must not cost the size.
    expect(classes).toContain("text-label");
  });

  it("still lets a caller override the type size", () => {
    const classes = rendered("sm", "text-heading");

    expect(classes).toContain("text-heading");
    expect(classes).not.toContain("text-label");
    expect(classes).toContain("text-primary-foreground");
  });
});
