import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const story = readFileSync(
  new URL("../stories/CrossPatternApplication.stories.tsx", import.meta.url),
  "utf8",
);

describe("Phase 6B Storybook theme and direction matrix", () => {
  it.each([
    ["LightLtrMatrix", "light", "ltr"],
    ["LightRtlMatrix", "light", "rtl"],
    ["DarkLtrMatrix", "dark", "ltr"],
    ["DarkRtlMatrix", "dark", "rtl"],
  ])("pins %s to %s/%s", (storyName, theme, direction) => {
    expect(story).toMatch(
      new RegExp(
        `export const ${storyName}:[\\s\\S]*?globals: \\{ theme: "${theme}", direction: "${direction}" \\}`,
      ),
    );
  });

  it.each([
    "Alert",
    "Breadcrumb",
    "Button",
    "Checkbox",
    "DataTable",
    "DatePicker",
    "DateRangePicker",
    "Dialog",
    "DropdownMenu",
    "Input",
    "LineChart",
    "Pagination",
    "Popover",
    "SearchableSelect",
    "Select",
    "Sheet",
    "Sidebar",
    "Switch",
    "ToastViewport",
    "Tooltip",
  ])("keeps %s in the representative review surface", (component) => {
    expect(story).toContain(`<${component}`);
  });

  it("exercises root selectors, portals, focus restoration, and narrow overflow", () => {
    expect(story).toContain('toHaveAttribute("data-theme", globals.theme)');
    expect(story).toContain('toHaveAttribute("dir", globals.direction)');
    expect(story).toContain("scrollWidth).toBeLessThanOrEqual");
    expect(story).toContain('page.getByRole("menu")');
    expect(story).toContain('page.getByRole("dialog"');
    expect(story).toContain("toHaveFocus()");
    expect(story).toContain(
      'globals.direction === "rtl" ? "{ArrowLeft}" : "{ArrowRight}"',
    );
    expect(story).toContain('name: "Search theme review assignees"');
  });
});
