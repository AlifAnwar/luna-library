import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  BreadcrumbSeparator,
  DirectionProvider,
  MultiSelect,
  PaginationNext,
  PaginationPrevious,
  Switch,
} from "@withalif/luna";

const componentSource = (name: string) =>
  readFileSync(
    new URL(
      `../../../packages/ui/src/components/ui/${name}.tsx`,
      import.meta.url,
    ),
    "utf8",
  );

describe("RTL layout contract", () => {
  it("uses logical spacing, alignment, insets, borders, and range corners", () => {
    const input = componentSource("input");
    const select = componentSource("select");
    const dropdownMenu = componentSource("dropdown-menu");
    const multiSelect = componentSource("multi-select");
    const passwordInput = componentSource("password-input");
    const dialog = componentSource("dialog");
    const sheet = componentSource("sheet");
    const stepper = componentSource("stepper");
    const sidebar = componentSource("sidebar");
    const calendar = componentSource("date-picker-calendar");

    expect(input).toContain("file:me-3");
    expect(input).not.toContain("file:mr-3");

    expect(select).toContain("text-start");
    expect(select).toContain("pe-8 ps-2");
    expect(select).toContain("absolute end-2");
    expect(select).not.toContain("dark:");

    expect(dropdownMenu).toContain("ps-8");
    expect(dropdownMenu).toContain("absolute start-2");
    expect(dropdownMenu).toContain("ms-auto rtl:-scale-x-100");

    expect(multiSelect).toContain("-me-1");
    expect(multiSelect).toContain("pe-8 ps-2");
    expect(multiSelect).toContain("absolute end-2");
    expect(multiSelect).toContain('direction === "rtl" ? "Right" : "Left"');

    expect(passwordInput).toContain('cn("pe-11"');
    expect(passwordInput).toContain("inset-y-0 end-1");
    expect(dialog).toContain("absolute top-2 end-2");
    expect(sheet).toContain("absolute top-3 end-3");
    expect(sheet).toContain("p-4 pe-12");
    expect(stepper).toContain("text-start");
    expect(stepper).toContain("ms-6 my-1");

    expect(sidebar).toContain("absolute top-3 end-3");
    expect(sidebar).toContain("text-start");
    expect(sidebar).toContain("border-s");
    expect(sidebar).toContain("border-e");
    expect(calendar).toContain("rounded-s-md");
    expect(calendar).toContain("rounded-e-md");
    expect(calendar).not.toContain("rounded-l-md");
    expect(calendar).not.toContain("rounded-r-md");
  });

  it("keeps documented physical geometry while logical popup sides mirror", () => {
    const dialog = componentSource("dialog");
    const sheet = componentSource("sheet");
    const select = componentSource("select");

    expect(dialog).toContain("left-1/2");
    expect(dialog).toContain("-translate-x-1/2");
    expect(sheet).toContain("right-0");
    expect(sheet).toContain("left-0");
    expect(sheet).toContain("slide-in-from-right");
    expect(sheet).toContain("slide-in-from-left");

    expect(select).toContain("data-[side=inline-end]:slide-in-from-left-2");
    expect(select).toContain(
      "rtl:data-[side=inline-end]:slide-in-from-right-2",
    );
    expect(select).toContain("data-[side=inline-start]:slide-in-from-right-2");
    expect(select).toContain(
      "rtl:data-[side=inline-start]:slide-in-from-left-2",
    );
    expect(select).toContain("data-[side=left]:slide-in-from-right-2");
    expect(select).toContain("data-[side=right]:slide-in-from-left-2");
  });

  it("mirrors Luna-owned navigation glyphs and the checked switch thumb", () => {
    const markup = renderToStaticMarkup(
      createElement(
        "div",
        { dir: "rtl" },
        createElement(BreadcrumbSeparator),
        createElement(PaginationPrevious),
        createElement(PaginationNext),
        createElement(Switch, { defaultChecked: true }),
      ),
    );

    expect(markup.match(/rtl:-scale-x-100/g)).toHaveLength(3);
    expect(markup).toContain("rtl:data-checked:-translate-x-4.5");
  });

  it("describes direction-aware chip keyboard navigation", () => {
    const renderDescription = (direction: "ltr" | "rtl") =>
      renderToStaticMarkup(
        createElement(
          DirectionProvider,
          { direction },
          createElement(MultiSelect, {
            "aria-label": "Skills",
            defaultValue: ["design"],
            items: [{ value: "design", label: "Design" }],
          }),
        ),
      );

    expect(renderDescription("ltr")).toContain(
      "press Left Arrow to focus selected items",
    );
    expect(renderDescription("rtl")).toContain(
      "press Right Arrow to focus selected items",
    );
  });

  it("places collapsed sidebar tooltips on the content-facing edge", () => {
    const sidebar = componentSource("sidebar");

    expect(sidebar).toContain(
      'side={sidebarSide === "left" ? "right" : "left"}',
    );
    expect(sidebar).toContain('side="inline-end"');
    expect(sidebar).not.toContain('<TooltipContent side="right"');
  });
});
