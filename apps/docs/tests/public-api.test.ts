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

describe("Phase 4A public API", () => {
  it.each(["KpiCard", "MetricCard", "TrendIndicator", "MetricComparison"])(
    "exports %s from the package entry point",
    (name) => {
      expect(luna).toHaveProperty(name);
      expect(luna[name as keyof typeof luna]).toBeTypeOf("function");
    },
  );
});

describe("Phase 4B public API", () => {
  it.each([
    "ChartContainer",
    "ChartEmptyState",
    "ChartHeader",
    "ChartLegend",
    "ChartLoadingState",
    "ChartTooltip",
  ])("exports %s from the package entry point", (name) => {
    expect(luna).toHaveProperty(name);
    expect(luna[name as keyof typeof luna]).toBeTypeOf("function");
  });
});

describe("Phase 4C public API", () => {
  it.each(["LineChart", "BarChart", "AreaChart"])(
    "exports %s from the package entry point",
    (name) => {
      expect(luna).toHaveProperty(name);
      expect(luna[name as keyof typeof luna]).toBeTypeOf("function");
    },
  );
});

describe("Phase 4D public API", () => {
  it.each(["PieChart", "DonutChart", "GaugeChart"])(
    "exports %s from the package entry point",
    (name) => {
      expect(luna).toHaveProperty(name);
      expect(luna[name as keyof typeof luna]).toBeTypeOf("function");
    },
  );
});

describe("Phase 4E public API", () => {
  it.each(["DashboardWidget", "DashboardGrid", "DashboardGridItem"])(
    "exports %s from the package entry point",
    (name) => {
      expect(luna).toHaveProperty(name);
      expect(luna[name as keyof typeof luna]).toBeTypeOf("function");
    },
  );
});

describe("Phase 5A public API", () => {
  it("exports the router-neutral sidebar navigation link", () => {
    expect(luna.SidebarMenuLink).toBeTypeOf("function");
  });
});

describe("Phase 5C public API", () => {
  it.each(["DetailList", "DetailField"])(
    "exports %s from the package entry point",
    (name) => {
      expect(luna).toHaveProperty(name);
      expect(luna[name as keyof typeof luna]).toBeTypeOf("function");
    },
  );
});

describe("Phase 5D public API", () => {
  it.each([
    "ActivityLog",
    "ActivityLogItem",
    "ApprovalTimeline",
    "ApprovalTimelineItem",
  ])("exports %s from the package entry point", (name) => {
    expect(luna).toHaveProperty(name);
    expect(luna[name as keyof typeof luna]).toBeTypeOf("function");
  });
});

describe("Phase 6B public API", () => {
  it("exports the Luna direction provider facade", () => {
    expect(luna.DirectionProvider).toBeTypeOf("function");
  });
});
