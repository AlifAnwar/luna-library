import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ChartContainer,
  ChartEmptyState,
  ChartHeader,
  ChartLegend,
  ChartLoadingState,
  ChartTooltip,
} from "@withalif/luna";

const render = (component: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(component);

describe("ChartContainer", () => {
  it("composes a caption, top legend, and responsive plot region", () => {
    const markup = render(
      createElement(ChartContainer, {
        className: "custom-chart",
        header: createElement(ChartHeader, {
          title: "Processed records",
          description: "Daily completed records.",
        }),
        legend: createElement(ChartLegend, {
          items: [{ id: "current", label: "Current", color: "chart-1" }],
        }),
        size: "lg",
        children: createElement("div", null, "Renderer"),
      }),
    );

    expect(markup).toContain('<figure data-slot="chart-container"');
    expect(markup).toContain('data-size="lg"');
    expect(markup).toContain('data-legend-position="top"');
    expect(markup).toContain("min-h-80");
    expect(markup).toContain("Processed records");
    expect(markup).toContain("Daily completed records.");
    expect(markup).toContain("Renderer");
    expect(markup).toMatch(/class="[^"]*\bcustom-chart\b/);
  });

  it("places a bottom legend after the plot", () => {
    const markup = render(
      createElement(ChartContainer, {
        legendPosition: "bottom",
        legend: createElement(ChartLegend, {
          items: [{ id: "current", label: "Current", color: "chart-1" }],
        }),
        children: "Renderer",
      }),
    );

    expect(markup.indexOf('data-slot="chart-plot"')).toBeLessThan(
      markup.indexOf('data-slot="chart-legend-region"'),
    );
  });
});

describe("ChartHeader", () => {
  it("uses visible caption content and supports an action", () => {
    const markup = render(
      createElement(ChartHeader, {
        className: "custom-header",
        title: "Throughput",
        description: "Completed units by day.",
        action: createElement("button", null, "View details"),
      }),
    );

    expect(markup).toContain('<figcaption data-slot="chart-header"');
    expect(markup).toContain("Throughput");
    expect(markup).toContain("Completed units by day.");
    expect(markup).toContain("View details");
    expect(markup).toMatch(/class="[^"]*\bcustom-header\b/);
  });
});

describe("ChartLegend", () => {
  it("pairs semantic chart colors with visible labels and marker patterns", () => {
    const markup = render(
      createElement(ChartLegend, {
        className: "custom-legend",
        label: "Series key",
        items: [
          {
            id: "current",
            label: "Current period",
            color: "chart-1",
            marker: "line",
          },
          {
            id: "previous",
            label: "Previous period",
            color: "chart-2",
            marker: "diamond",
          },
        ],
      }),
    );

    expect(markup).toContain('aria-label="Series key"');
    expect(markup).toContain("Current period");
    expect(markup).toContain("Previous period");
    expect(markup).toContain('data-marker="line"');
    expect(markup).toContain('data-marker="diamond"');
    expect(markup).toContain("var(--chart-1)");
    expect(markup).toContain("var(--chart-2)");
    expect(markup).toMatch(/class="[^"]*\bcustom-legend\b/);
  });
});

describe("ChartTooltip", () => {
  it("renders labelled values through the consumer formatter", () => {
    const formatValue = vi.fn(
      (value: number, item: { id: string }) => `${item.id}: ${value}%`,
    );
    const markup = render(
      createElement(ChartTooltip, {
        className: "custom-tooltip",
        label: "24 Sep 2026",
        items: [
          {
            id: "completion",
            label: "Completion",
            value: 94.8,
            color: "chart-1",
          },
        ],
        formatValue,
      }),
    );

    expect(markup).toContain('role="tooltip"');
    expect(markup).toContain("24 Sep 2026");
    expect(markup).toContain("Completion");
    expect(markup).toContain("completion: 94.8%");
    expect(markup).toContain("<dl");
    expect(markup).toMatch(/class="[^"]*\bcustom-tooltip\b/);
    expect(formatValue).toHaveBeenCalledOnce();
  });

  it("does not render when inactive or empty", () => {
    expect(
      render(
        createElement(ChartTooltip, {
          active: false,
          items: [{ id: "one", label: "One", value: 1 }],
        }),
      ),
    ).toBe("");
    expect(render(createElement(ChartTooltip, { items: [] }))).toBe("");
  });
});

describe("ChartEmptyState", () => {
  it("provides generic defaults without inventing data", () => {
    const markup = render(createElement(ChartEmptyState));

    expect(markup).toContain('data-slot="chart-empty-state"');
    expect(markup).toContain("No data available");
    expect(markup).toContain("Data will appear when it becomes available.");
  });

  it("supports consumer copy, an action, and class overrides", () => {
    const markup = render(
      createElement(ChartEmptyState, {
        className: "custom-empty",
        title: "No matching records",
        description: "Clear the active filters.",
        action: createElement("button", null, "Clear filters"),
      }),
    );

    expect(markup).toContain("No matching records");
    expect(markup).toContain("Clear the active filters.");
    expect(markup).toContain("Clear filters");
    expect(markup).toMatch(/class="[^"]*\bcustom-empty\b/);
  });
});

describe("ChartLoadingState", () => {
  it("preserves layout and announces loading without fake chart data", () => {
    const markup = render(
      createElement(ChartLoadingState, {
        className: "custom-loading",
        label: "Loading processed records",
      }),
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("Loading processed records");
    expect(markup).toContain('data-slot="skeleton"');
    expect(markup).toContain("motion-reduce:animate-none");
    expect(markup).toMatch(/class="[^"]*\bcustom-loading\b/);
  });
});
