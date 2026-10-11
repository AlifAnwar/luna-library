import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { GaugeChart } from "@withalif/luna";

const render = (component: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(component);

const base = {
  title: "Target completion",
  description: "Completed work against the target.",
};

describe("GaugeChart", () => {
  it("renders a labelled meter with the formatted reading", () => {
    const formatValue = vi.fn((value: number) => `${value}%`);
    const markup = render(
      createElement(GaugeChart, {
        ...base,
        className: "custom-gauge",
        value: 70.8,
        formatValue,
        centerLabel: "Of target",
      }),
    );

    expect(markup).toContain('data-chart-kind="gauge"');
    expect(markup).toContain('data-variant="default"');
    expect(markup).toContain('role="meter"');
    expect(markup).toContain('aria-valuenow="70.8"');
    expect(markup).toContain('aria-valuemin="0"');
    expect(markup).toContain('aria-valuemax="100"');
    expect(markup).toContain('aria-valuetext="70.8%"');
    expect(markup).toContain('data-slot="gauge-track"');
    expect(markup).toContain('data-slot="gauge-value"');
    expect(markup).toContain("<bdi>70.8%</bdi>");
    expect(markup).toContain("Of target");
    expect(formatValue).toHaveBeenCalledWith(70.8);
    expect(markup).toMatch(/class="[^"]*\bcustom-gauge\b/);
  });

  it("fills segmented blocks up to the value without rounding up", () => {
    const markup = render(
      createElement(GaugeChart, {
        ...base,
        value: 55,
        variant: "segmented",
        segments: 10,
      }),
    );

    expect(markup.match(/data-slot="gauge-segment"/g)).toHaveLength(10);
    expect(markup.match(/data-filled=""/g)).toHaveLength(5);
  });

  it("clamps the meter to its scale but shows the actual reading", () => {
    const markup = render(
      createElement(GaugeChart, {
        ...base,
        value: 132,
        max: 120,
        valueText: "132 of 120 seats",
      }),
    );

    expect(markup).toContain('aria-valuenow="120"');
    expect(markup).toContain('aria-valuetext="132 of 120 seats"');
    expect(markup).toContain("<bdi>132</bdi>");
  });

  it("does not render a visually hidden, focusable header action", () => {
    const markup = render(
      createElement(GaugeChart, {
        ...base,
        value: 70,
        showHeader: false,
        headerAction: createElement("button", null, "Export chart"),
      }),
    );

    expect(markup).toContain("Target completion");
    expect(markup).not.toContain("Export chart");
    expect(markup).not.toContain("<button");
  });

  it("omits the value arc at zero", () => {
    const markup = render(createElement(GaugeChart, { ...base, value: 0 }));

    expect(markup).toContain('data-slot="gauge-track"');
    expect(markup).not.toContain('data-slot="gauge-value"');
  });

  it("renders loading and empty states without fake data", () => {
    const loading = render(
      createElement(GaugeChart, {
        ...base,
        value: 40,
        loading: true,
        loadingLabel: "Loading completion",
      }),
    );
    const empty = render(
      createElement(GaugeChart, {
        ...base,
        value: null,
        emptyTitle: "No target set",
      }),
    );

    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain("Loading completion");
    expect(loading).not.toContain('role="meter"');
    expect(empty).toContain('data-slot="chart-empty-state"');
    expect(empty).toContain("No target set");
    expect(empty).not.toContain('role="meter"');
  });

  it("falls back to the default block count for a non-finite segment count", () => {
    const markup = render(
      createElement(GaugeChart, {
        ...base,
        value: 50,
        variant: "segmented",
        segments: Number.NaN,
      }),
    );

    expect(markup.match(/data-slot="gauge-segment"/g)).toHaveLength(16);
  });

  it.each([
    { min: 100, max: 100 },
    { min: 100, max: 0 },
    { min: 0, max: Number.NaN },
  ])("renders the empty state for an invalid scale ($min–$max)", (scale) => {
    const markup = render(
      createElement(GaugeChart, { ...base, value: 50, ...scale }),
    );

    expect(markup).toContain('data-slot="chart-empty-state"');
    expect(markup).not.toContain('role="meter"');
  });
});
