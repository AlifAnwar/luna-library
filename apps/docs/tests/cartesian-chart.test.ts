import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  AreaChart,
  BarChart,
  LineChart,
  type CartesianChartDatum,
  type CartesianChartSeries,
} from "@withalif/luna";

const data = [
  { category: "Apr", current: 1280, previous: 1120 },
  { category: "May", current: 1460, previous: null },
] satisfies readonly CartesianChartDatum[];

const series = [
  { dataKey: "current", label: "Current period" },
  { dataKey: "previous", label: "Previous period", marker: "dash" },
] satisfies readonly CartesianChartSeries[];

const render = (component: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(component);

describe.each([
  ["line", LineChart],
  ["bar", BarChart],
  ["area", AreaChart],
] as const)("%s chart", (kind, Chart) => {
  it("renders a labelled responsive chart with an accessible data table", () => {
    const markup = render(
      createElement(Chart, {
        className: "custom-chart",
        title: "Processed records",
        description: "Monthly completed records.",
        data,
        series,
      }),
    );

    expect(markup).toContain(`data-chart-kind="${kind}"`);
    expect(markup).toContain('data-show-header="true"');
    expect(markup).toContain('data-variant="default"');
    if (kind === "area") {
      expect(markup).toContain('data-fill="solid"');
    }
    if (kind === "bar") {
      expect(markup).toContain('data-fill="pattern"');
    }
    expect(markup).toContain("Processed records");
    expect(markup).toContain("Monthly completed records.");
    expect(markup).toContain("Current period");
    expect(markup).toContain("Previous period");
    expect(markup).toContain("<table>");
    expect(markup).toContain('<th scope="col">Category</th>');
    expect(markup).toContain('<th scope="row">Apr</th>');
    expect(markup).toContain(">1280</bdi>");
    expect(markup).toContain("No value");
    expect(markup).toMatch(/class="[^"]*\bcustom-chart\b/);
  });

  it("supports the opt-in modern visual variant", () => {
    const markup = render(
      createElement(Chart, {
        title: "Processed records",
        description: "Monthly completed records.",
        data,
        series,
        variant: "modern",
      }),
    );

    expect(markup).toContain(`data-chart-kind="${kind}"`);
    expect(markup).toContain('data-variant="modern"');
  });

  it("renders loading and empty states without fake chart data", () => {
    const loading = render(
      createElement(Chart, {
        title: "Processed records",
        description: "Monthly completed records.",
        data,
        series,
        loading: true,
        loadingLabel: "Loading processed records",
      }),
    );
    const empty = render(
      createElement(Chart, {
        title: "Processed records",
        description: "Monthly completed records.",
        data: [],
        series,
        emptyTitle: "No matching records",
        emptyDescription: "Clear the active filters.",
      }),
    );

    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('data-slot="chart-loading-state"');
    expect(loading).toContain("Loading processed records");
    expect(loading).not.toContain("<table>");
    expect(empty).toContain('data-slot="chart-empty-state"');
    expect(empty).toContain("No matching records");
    expect(empty).toContain("Clear the active filters.");
    expect(empty).not.toContain("<table>");
  });
});

describe("Cartesian chart sizing", () => {
  it("applies a consumer plot class", () => {
    const markup = render(
      createElement(LineChart, {
        title: "Processed records",
        description: "Monthly completed records.",
        data,
        series,
        plotClassName: "h-96",
      }),
    );

    expect(markup).toMatch(/data-slot="chart-plot" class="[^"]*\bh-96\b/);
  });
});

describe("Area chart fills", () => {
  it.each(["solid", "gradient"] as const)(
    "supports the %s fill treatment",
    (fill) => {
      const markup = render(
        createElement(AreaChart, {
          title: "Performance trend",
          description: "Performance across the selected period.",
          data,
          series,
          fill,
          variant: "modern",
        }),
      );

      expect(markup).toContain(`data-fill="${fill}"`);
      expect(markup).toContain('data-variant="modern"');
    },
  );
});

describe("Bar chart fills", () => {
  it.each(["solid", "gradient"] as const)(
    "supports the %s fill treatment for non-stacked bars",
    (fill) => {
      const markup = render(
        createElement(BarChart, {
          title: "Sales by channel",
          description: "Sales across channels.",
          data,
          series: [series[0]!],
          fill,
          variant: "modern",
        }),
      );

      expect(markup).toContain('data-bar-layout="grouped"');
      expect(markup).toContain(`data-fill="${fill}"`);
    },
  );
});

describe("Bar chart layouts", () => {
  it("supports stacked modern bars", () => {
    const stackedSeries = [
      { dataKey: "closed", label: "Closed sales" },
      { dataKey: "qualified", label: "Qualified pipeline" },
      { dataKey: "potential", label: "Remaining opportunity" },
    ] satisfies readonly CartesianChartSeries[];
    const markup = render(
      createElement(BarChart, {
        title: "Sales by channel",
        description: "Sales and opportunity by channel.",
        data: [{ category: "Direct", closed: 8, qualified: 4, potential: 6 }],
        series: stackedSeries,
        fill: "gradient",
        layout: "stacked",
        variant: "modern",
      }),
    );

    expect(markup).toContain('data-bar-layout="stacked"');
    expect(markup).toContain('data-fill="solid"');
    expect(markup).toContain('data-variant="modern"');
    expect(markup).toContain("Closed sales");
    expect(markup).toContain("Qualified pipeline");
    expect(markup).toContain("Remaining opportunity");
  });

  it("keeps a visually hidden title and description for spark charts", () => {
    const markup = render(
      createElement(BarChart, {
        title: "Cost trend",
        description: "Cost movement during the last 24 hours.",
        data,
        series: [series[0]!],
        size: "spark",
        showHeader: false,
        showGrid: false,
        showXAxis: false,
        showYAxis: false,
      }),
    );

    expect(markup).toContain('data-size="spark"');
    expect(markup).toContain('data-show-header="false"');
    expect(markup).toContain("Cost trend");
    expect(markup).toContain("Cost movement during the last 24 hours.");
    expect(markup).toContain("sr-only");
  });
});

describe("Segmented bar chart", () => {
  const mix = [
    { category: "Dine in", orders: 50 },
    { category: "Pick-up", orders: 30 },
    { category: "Delivery", orders: 20 },
    { category: "Catering", orders: 0 },
    { category: "Kiosk", orders: null },
  ] satisfies readonly CartesianChartDatum[];

  it("draws one part-to-whole bar with direct labels and share values", () => {
    const markup = render(
      createElement(BarChart, {
        title: "Orders by channel",
        description: "Share of orders by service channel.",
        data: mix,
        series: [{ dataKey: "orders", label: "Share of orders" }],
        layout: "stacked",
        variant: "segmented",
      }),
    );

    expect(markup).toContain('data-variant="segmented"');
    expect(markup).not.toContain("data-bar-layout");
    expect(markup).not.toContain("data-fill");
    expect(markup).not.toContain('data-slot="chart-legend"');
    expect(markup.match(/data-slot="chart-segment"/g)).toHaveLength(3);
    expect(markup).toContain("flex-grow:50");
    expect(markup).toContain('<th scope="row">Dine in</th>');
    expect(markup).toContain(">50%</bdi>");
    expect(markup).toContain(">30%</bdi>");
    expect(markup).not.toContain("Catering");
    expect(markup).not.toContain("Kiosk");
  });

  it("uses the consumer formatter and hides labels at spark size", () => {
    const markup = render(
      createElement(BarChart, {
        title: "Orders by channel",
        description: "Orders by service channel.",
        data: mix,
        series: [{ dataKey: "orders", label: "Orders" }],
        size: "spark",
        variant: "segmented",
        formatValue: (value) => `${value} orders`,
      }),
    );

    expect(markup).toContain(">50 orders</bdi>");
    expect(markup).not.toContain("border-s-2");
  });

  it("shows the empty state when no segment has a positive value", () => {
    const markup = render(
      createElement(BarChart, {
        title: "Orders by channel",
        description: "Share of orders by service channel.",
        data: [{ category: "Dine in", orders: 0 }],
        series: [{ dataKey: "orders", label: "Orders" }],
        variant: "segmented",
      }),
    );

    expect(markup).toContain('data-slot="chart-empty-state"');
    expect(markup).not.toContain("<table>");
  });
});

describe("Segmented list bar chart", () => {
  const channels = [
    { category: "Dine in", orders: 60, change: -2, time: 919 },
    { category: "Pickup", orders: 40, change: 1, time: null },
  ] satisfies readonly CartesianChartDatum[];
  const channelSeries = [
    { dataKey: "orders", label: "Share of orders" },
    { dataKey: "change", label: "Change vs. last week" },
    { dataKey: "time", label: "Avg. completion time" },
  ] satisfies readonly CartesianChartSeries[];

  it("lists the remaining series under a bar-only segmented bar", () => {
    const markup = render(
      createElement(BarChart, {
        title: "Completion time by channel",
        description: "Change and average completion time by channel.",
        data: channels,
        series: channelSeries,
        variant: "segmented-list",
        getValueTone: (value, item) =>
          item.dataKey === "change"
            ? value < 0
              ? "success"
              : "danger"
            : "neutral",
      }),
    );

    expect(markup).toContain('data-variant="segmented-list"');
    expect(markup.match(/data-slot="chart-segment"/g)).toHaveLength(2);
    expect(markup.match(/data-slot="chart-segment-row"/g)).toHaveLength(2);
    expect(markup).not.toContain("border-s-2");
    expect(markup).toContain('data-tone="success"');
    expect(markup).toContain('data-tone="danger"');
    expect(markup).toContain(">-2</bdi>");
    expect(markup).toContain(">919</bdi>");
    expect(markup).toContain("No value");
    expect(markup).toContain('<th scope="col">Avg. completion time</th>');
    expect(markup).toContain(">60%</bdi>");
  });

  it("lists the share when there is only one series", () => {
    const markup = render(
      createElement(BarChart, {
        title: "Orders by channel",
        description: "Share of orders by channel.",
        data: channels,
        series: [channelSeries[0]!],
        variant: "segmented-list",
      }),
    );

    expect(markup.match(/data-slot="chart-segment-row"/g)).toHaveLength(2);
    expect(markup.match(/>40%<\/bdi>/g)?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("Meter bar chart", () => {
  const meters = [
    { category: "Performing progress", completion: 89, change: 10.2 },
    { category: "Target sales", completion: 67, change: -2.2 },
    { category: "Unreported", completion: null, change: 1 },
  ] satisfies readonly CartesianChartDatum[];
  const meterSeries = [
    { dataKey: "completion", label: "Completion" },
    { dataKey: "change", label: "Change vs. last week" },
  ] satisfies readonly CartesianChartSeries[];

  it("fills one tick meter per row and renders trends as pills", () => {
    const markup = render(
      createElement(BarChart, {
        title: "Project progress",
        description: "Completion rate across projects.",
        data: meters,
        series: meterSeries,
        variant: "meter",
        formatValue: (value) => `${value}%`,
        getValueTone: (value) => (value > 0 ? "success" : "danger"),
      }),
    );

    expect(markup).toContain('data-variant="meter"');
    expect(markup).not.toContain('data-slot="chart-legend"');
    expect(markup.match(/data-slot="chart-meter"/g)).toHaveLength(2);
    // 89% and 67% of 36 ticks, rounded.
    expect(markup.match(/data-filled=""/g)).toHaveLength(32 + 24);
    expect(markup).toContain('data-direction="up" data-tone="success"');
    expect(markup).toContain('data-direction="down" data-tone="danger"');
    expect(markup).toContain(">2.2%</bdi>");
    expect(markup).toContain(">-2.2%</bdi>");
    expect(markup).not.toContain("Unreported");
  });

  it("clamps the fill to the scale maximum", () => {
    const markup = render(
      createElement(BarChart, {
        title: "Tickets closed",
        description: "Tickets closed against the weekly goal.",
        data: [{ category: "Closed", tickets: 60 }],
        series: [{ dataKey: "tickets", label: "Tickets" }],
        variant: "meter",
        max: 40,
      }),
    );

    expect(markup.match(/data-filled=""/g)).toHaveLength(36);
    expect(markup).toContain(">60</bdi>");
  });
});

describe("Cartesian chart formatters", () => {
  it("uses consumer formatters for the accessible data alternative", () => {
    const formatCategory = vi.fn((value: string | number) => `Period ${value}`);
    const formatValue = vi.fn((value: number) => `${value} records`);
    const markup = render(
      createElement(LineChart, {
        title: "Processed records",
        description: "Monthly completed records.",
        data,
        series: [series[0]!],
        formatCategory,
        formatValue,
      }),
    );

    expect(markup).toContain("Period Apr");
    expect(markup).toContain("1280 records");
    expect(formatCategory).toHaveBeenCalled();
    expect(formatValue).toHaveBeenCalled();
  });

  it("supports a custom category key and localized missing-value label", () => {
    const markup = render(
      createElement(BarChart, {
        title: "Processed records",
        description: "Monthly completed records.",
        categoryKey: "period",
        data: [{ period: "Q1", current: 24, previous: null }],
        series,
        missingValueLabel: "Tidak ada nilai",
      }),
    );

    expect(markup).toContain('<th scope="row">Q1</th>');
    expect(markup).toContain("Tidak ada nilai");
  });
});
