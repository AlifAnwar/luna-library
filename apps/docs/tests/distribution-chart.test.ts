import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  DonutChart,
  PieChart,
  type DistributionChartDatum,
} from "@withalif/luna";

const data = [
  { category: "Resolved", value: 4820, percentage: 58.1 },
  { category: "In progress", value: 1935, percentage: 23.3 },
  { category: "Escalated", value: 0, percentage: 0 },
] satisfies readonly DistributionChartDatum[];

const render = (component: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(component);

describe.each([
  ["pie", PieChart],
  ["donut", DonutChart],
] as const)("%s chart", (kind, Chart) => {
  it("renders a labelled, keyboard-focusable chart with an accessible data table", () => {
    const markup = render(
      createElement(Chart, {
        className: "custom-chart",
        title: "Requests by status",
        description: "Requests in the current period.",
        data,
      }),
    );

    expect(markup).toContain(`data-chart-kind="${kind}"`);
    expect(markup).toContain('data-variant="default"');
    expect(markup).toContain('data-legend-position="end"');
    expect(markup).toMatch(/role="group" tabindex="0"/);
    expect(markup).toContain("Use the arrow keys to move between segments.");
    expect(markup).toContain('<ul data-slot="chart-legend"');
    expect(markup).toContain("<table>");
    expect(markup).toContain('<th scope="col">Category</th>');
    expect(markup).toContain('<th scope="col">Value</th>');
    expect(markup).toContain('<th scope="col">Share</th>');
    expect(markup).toContain('<th scope="row">Resolved</th>');
    expect(markup).toContain(">4820</bdi>");
    expect(markup).toContain(">58.1%</bdi>");
    expect(markup).toMatch(/class="[^"]*\bcustom-chart\b/);
  });

  it("keeps zero values in the legend and table without inventing percentages", () => {
    const markup = render(
      createElement(Chart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data: data.map(({ category, value }) => ({ category, value })),
      }),
    );

    expect(markup).toContain('<th scope="row">Escalated</th>');
    expect(markup).not.toContain('<th scope="col">Share</th>');
    expect(markup).not.toMatch(/>[\d.]+%</);
  });

  it("drops negative and non-finite values", () => {
    const markup = render(
      createElement(Chart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data: [
          { category: "Resolved", value: 12 },
          { category: "Reopened", value: -4 },
          { category: "Unknown", value: Number.NaN },
        ],
      }),
    );

    expect(markup).toContain('<th scope="row">Resolved</th>');
    expect(markup).not.toContain("Reopened");
    expect(markup).not.toContain("Unknown");
  });

  it("passes values and percentages through the consumer formatters", () => {
    const formatValue = vi.fn((value: number) => `${value} items`);
    const formatPercentage = vi.fn((percentage: number) => `${percentage} pct`);
    const markup = render(
      createElement(Chart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data,
        valueLabel: "Requests",
        percentageLabel: "Share of requests",
        categoryLabel: "Status",
        formatValue,
        formatPercentage,
      }),
    );

    expect(formatValue).toHaveBeenCalledWith(4820, data[0]);
    expect(formatPercentage).toHaveBeenCalledWith(58.1, data[0]);
    expect(markup).toContain("4820 items");
    expect(markup).toContain("58.1 pct");
    expect(markup).toContain('<th scope="col">Status</th>');
    expect(markup).toContain('<th scope="col">Requests</th>');
    expect(markup).toContain('<th scope="col">Share of requests</th>');
  });

  it("supports the modern variant, a bottom legend, and a hidden legend", () => {
    const modern = render(
      createElement(Chart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data,
        variant: "modern",
        legendPosition: "bottom",
      }),
    );
    const hidden = render(
      createElement(Chart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data,
        showLegend: false,
      }),
    );

    expect(modern).toContain('data-variant="modern"');
    expect(modern).toContain('data-legend-position="bottom"');
    expect(modern.indexOf('data-slot="chart-plot"')).toBeLessThan(
      modern.indexOf('data-slot="chart-legend-region"'),
    );
    expect(hidden).not.toContain('data-slot="chart-legend"');
    expect(hidden).toContain("<table>");
  });

  it("renders loading and empty states without fake chart data", () => {
    const loading = render(
      createElement(Chart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data,
        loading: true,
        loadingLabel: "Loading requests",
      }),
    );
    const empty = render(
      createElement(Chart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data: [{ category: "Resolved", value: 0 }],
        emptyTitle: "No requests yet",
        emptyDescription: "Requests appear after the first submission.",
      }),
    );

    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('data-slot="chart-loading-state"');
    expect(loading).toContain("Loading requests");
    expect(loading).not.toContain("<table>");
    expect(loading).not.toContain('data-slot="chart-legend"');
    expect(empty).toContain('data-slot="chart-empty-state"');
    expect(empty).toContain("No requests yet");
    expect(empty).not.toContain("<table>");
  });
});

describe("Distribution chart slice labels", () => {
  const labelled = (props: Record<string, unknown>) =>
    render(
      createElement(PieChart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data: [
          { category: "Resolved", value: 60, percentage: 60 },
          { category: "In progress", value: 37, percentage: 37 },
          { category: "Escalated", value: 3, percentage: 3 },
          { category: "Unshared", value: 20 },
        ],
        ...props,
      }),
    );

  it("renders no slice labels by default", () => {
    expect(labelled({})).not.toContain('data-slot="chart-slice-label"');
  });

  it("prints consumer-supplied percentages and skips slices too narrow or without one", () => {
    const markup = labelled({ sliceLabel: "percentage" });
    const labels = markup.match(/data-slot="chart-slice-label"/g) ?? [];

    expect(markup).toContain('data-slice-label="percentage"');
    expect(labels).toHaveLength(2);
    expect(markup).toMatch(
      /aria-hidden="true"[^>]*><span data-slot="chart-slice-label"/,
    );
    const readings = [
      ...markup.matchAll(/data-slot="chart-slice-label"[^>]*><bdi>([^<]*)</g),
    ].map((match) => match[1]);

    expect(readings).toEqual(["60%", "37%"]);
  });

  it("prints formatted values when asked", () => {
    const markup = labelled({
      sliceLabel: "value",
      formatValue: (value: number) => `${value} items`,
    });

    expect(markup).toContain("<bdi>60 items</bdi>");
    expect(markup).toContain("<bdi>20 items</bdi>");
  });

  it("omits slice labels at spark size", () => {
    expect(labelled({ sliceLabel: "percentage", size: "spark" })).not.toContain(
      'data-slot="chart-slice-label"',
    );
  });
});

describe("DonutChart half arc", () => {
  it("crops a full square to a half-height plot and seats the center on the flat edge", () => {
    const markup = render(
      createElement(DonutChart, {
        title: "Orders by customer type",
        description: "Orders placed this week.",
        data,
        arc: "half",
        centerValue: "6,755",
      }),
    );

    expect(markup).toContain('data-arc="half"');
    expect(markup).toMatch(/data-slot="chart-plot" class="[^"]*\bh-22 w-44\b/);
    expect(markup).toMatch(/data-arc="half" class="[^"]*\baspect-square\b/);
    expect(markup).toMatch(
      /data-slot="chart-donut-center" class="[^"]*\bbottom-1\/2\b/,
    );
    expect(markup).toContain("<table>");
  });

  it("defaults to a full ring", () => {
    const markup = render(
      createElement(DonutChart, {
        title: "Orders by customer type",
        description: "Orders placed this week.",
        data,
      }),
    );

    expect(markup).toContain('data-arc="full"');
    expect(markup).toMatch(/data-slot="chart-plot" class="[^"]*\bh-44 w-44\b/);
  });
});

describe("Distribution chart sizing", () => {
  it("lets consumers override the preset plot size", () => {
    const markup = render(
      createElement(DonutChart, {
        className: "max-w-sm",
        title: "Requests by status",
        description: "Requests in the current period.",
        data,
        plotClassName: "h-64 w-64",
      }),
    );

    expect(markup).toMatch(/data-slot="chart-plot" class="[^"]*\bh-64 w-64\b/);
    expect(markup).not.toMatch(/data-slot="chart-plot" class="[^"]*\bh-44\b/);
    expect(markup).toMatch(/class="[^"]*\bmax-w-sm\b/);
  });
});

describe("DonutChart center label", () => {
  it("renders consumer-supplied center content", () => {
    const markup = render(
      createElement(DonutChart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data,
        centerValue: "6,755",
        centerLabel: "Total requests",
      }),
    );

    expect(markup).toContain('data-slot="chart-donut-center"');
    expect(markup).toContain("6,755");
    expect(markup).toContain("Total requests");
  });

  it("omits the center at spark size, where the hole is too small to read", () => {
    const markup = render(
      createElement(DonutChart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data,
        size: "spark",
        centerValue: "6,755",
      }),
    );

    expect(markup).not.toContain('data-slot="chart-donut-center"');
    expect(markup).not.toContain('data-slot="chart-legend"');
  });

  it("is not offered by PieChart", () => {
    const markup = render(
      createElement(PieChart, {
        title: "Requests by status",
        description: "Requests in the current period.",
        data,
      }),
    );

    expect(markup).not.toContain('data-slot="chart-donut-center"');
  });
});
