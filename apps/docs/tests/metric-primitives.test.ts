import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  KpiCard,
  MetricCard,
  MetricComparison,
  TrendIndicator,
} from "@withalif/luna";

const render = (component: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(component);

describe("TrendIndicator", () => {
  it("keeps direction independent from semantic tone", () => {
    const markup = render(
      createElement(TrendIndicator, {
        direction: "down",
        value: "18%",
        tone: "success",
        toneLabel: "Favorable",
      }),
    );

    expect(markup).toContain('data-direction="down"');
    expect(markup).toContain('data-tone="success"');
    expect(markup).toContain("Decreased:");
    expect(markup).toContain("Favorable");
  });

  it("supports localized direction text and class overrides", () => {
    const markup = render(
      createElement(TrendIndicator, {
        className: "custom-trend",
        direction: "up",
        directionLabel: "Meningkat",
        value: "12,4%",
      }),
    );

    expect(markup).toContain("Meningkat:");
    expect(markup).toMatch(/class="[^"]*\bcustom-trend\b/);
  });
});

describe("KpiCard", () => {
  it("renders its public content and a formatted consumer value", () => {
    const markup = render(
      createElement(KpiCard, {
        label: "Monthly revenue",
        value: "Rp128.400.000",
        secondaryValue: "before tax",
        description: "vs previous month",
        trend: { direction: "up", value: "12.4%" },
      }),
    );

    expect(markup).toContain('data-slot="kpi-card"');
    expect(markup).toContain('data-state="default"');
    expect(markup).toContain("Monthly revenue");
    expect(markup).toContain("Rp128.400.000");
    expect(markup).toContain("before tax");
    expect(markup).toContain("vs previous month");
  });

  it("preserves a labelled loading layout without fake data", () => {
    const markup = render(
      createElement(KpiCard, {
        label: "Monthly revenue",
        status: "loading",
        loadingLabel: "Loading monthly revenue",
      }),
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('<span role="status" class="sr-only">');
    expect(markup).toContain("Loading monthly revenue");
    expect(markup).toContain('data-slot="skeleton"');
  });

  it("renders explicit empty and unavailable states", () => {
    const empty = render(
      createElement(KpiCard, {
        label: "Monthly revenue",
        status: "empty",
      }),
    );
    const unavailable = render(
      createElement(KpiCard, {
        label: "Monthly revenue",
        status: "unavailable",
        stateLabel: "Source unavailable",
      }),
    );

    expect(empty).toContain("No data");
    expect(unavailable).toContain("Source unavailable");
  });
});

describe("MetricCard", () => {
  it("renders a zero value and extends its classes", () => {
    const markup = render(
      createElement(MetricCard, {
        className: "custom-card",
        label: "Open requests",
        value: 0,
      }),
    );

    expect(markup).toContain('data-slot="metric-card"');
    expect(markup).toContain(">0</bdi>");
    expect(markup).toMatch(/class="[^"]*\bcustom-card\b/);
  });
});

describe("MetricComparison", () => {
  it("renders labelled values with optional descriptions", () => {
    const markup = render(
      createElement(MetricComparison, {
        className: "custom-comparison",
        items: [
          { label: "Current", value: "$128,400" },
          {
            label: "Previous",
            value: "$114,240",
            description: "Last month",
          },
        ],
      }),
    );

    expect(markup).toContain('data-slot="metric-comparison"');
    expect(markup).toContain("<dt");
    expect(markup).toContain("Current");
    expect(markup).toContain("$128,400");
    expect(markup).toContain("Last month");
    expect(markup).toMatch(/class="[^"]*\bcustom-comparison\b/);
  });
});
