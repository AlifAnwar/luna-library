import { describe, expect, it } from "vitest";

import * as luna from "@withalif/luna";

describe("Phase 3 public API", () => {
  it.each([
    "DataTable",
    "DataTableBulkActions",
    "DataTableColumnHeader",
    "DataTableExport",
    "DataTableFilter",
    "DataTablePagination",
    "DataTableSearch",
    "DataTableToolbar",
    "DataTableViewOptions",
  ])("exports %s from the package entry point", (name) => {
    expect(luna).toHaveProperty(name);
    expect(luna[name as keyof typeof luna]).toBeTypeOf("function");
  });

  it("keeps the class merge helper internal", () => {
    expect(luna).not.toHaveProperty("cn");
  });
});
