import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import * as luna from "@withalif/luna";
import { DataTableExport, type DataTableExportProps } from "@withalif/luna";

/**
 * The closed state of the control, rendered through the public entry point.
 * The menu itself only mounts in a browser, so opening it, the items it
 * offers and the requests they emit are covered by the DataTable Export
 * stories.
 */
const render = (props: Partial<DataTableExportProps> = {}) =>
  renderToStaticMarkup(
    createElement(DataTableExport, { onExport: () => {}, ...props }),
  );

const trigger = (markup: string) => {
  const match = markup.match(/<button[^>]*>/);

  expect(match).not.toBeNull();
  return match![0];
};

describe("DataTableExport", () => {
  it("is exported from the package without its internals", () => {
    expect(luna.DataTableExport).toBeTypeOf("function");
    expect(luna).not.toHaveProperty("cn");
  });

  it("renders a labelled menu trigger", () => {
    const markup = render();

    expect(trigger(markup)).toContain('aria-haspopup="menu"');
    expect(trigger(markup)).toContain('data-slot="data-table-export"');
    expect(markup).toContain(">Export</span>");
  });

  it("renders nothing when no format is offered", () => {
    expect(render({ formats: [] })).toBe("");
  });

  it("still renders when duplicate formats collapse to one", () => {
    expect(render({ formats: ["csv", "csv"] })).toContain("Export");
  });

  it("extends the trigger classes with className", () => {
    const button = trigger(render({ className: "w-full" }));

    expect(button).toMatch(/class="[^"]*\bw-full\b/);
    expect(button).toMatch(/class="[^"]*\bmin-w-0\b/);
  });

  it("marks the trigger busy and unavailable while loading", () => {
    const markup = render({ loading: true });
    const button = trigger(markup);

    expect(button).toContain('aria-busy="true"');
    expect(button).toContain('aria-disabled="true"');
    // Kept focusable, so focus is not dropped the moment loading starts.
    expect(button).not.toMatch(/\sdisabled(=""|\s|>)/);
    expect(markup).toContain("Export in progress");
  });

  it("keeps the busy region mounted and empty when idle", () => {
    const markup = render();

    expect(markup).toContain('<span role="status" class="sr-only"></span>');
  });

  it("disables the trigger natively when disabled", () => {
    const button = trigger(render({ disabled: true }));

    expect(button).toMatch(/\sdisabled(=""|\s|>)/);
    expect(button).not.toContain("aria-busy");
  });

  it("stays natively disabled when disabled and loading together", () => {
    const button = trigger(render({ disabled: true, loading: true }));

    expect(button).toMatch(/\sdisabled(=""|\s|>)/);
  });
});
