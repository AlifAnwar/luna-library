import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  DashboardGrid,
  DashboardGridItem,
  DashboardWidget,
  KpiCard,
} from "@withalif/luna";

const render = (component: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(component);

describe("DashboardWidget", () => {
  it("renders children in a named and described region using the card surface", () => {
    const markup = render(
      createElement(DashboardWidget, {
        title: "Monthly activity",
        description: "Completed records by month.",
        className: "custom-widget",
        children: createElement("p", null, "1,920 records completed"),
      }),
    );

    expect(markup).toContain('data-slot="dashboard-widget"');
    expect(markup).toContain('role="region"');
    expect(markup).toMatch(/aria-labelledby="([^"]+)"/);
    expect(markup).toMatch(/aria-describedby="([^"]+)"/);
    expect(markup).toContain("<h2");
    expect(markup).toContain("Monthly activity</h2>");
    expect(markup).toContain("Completed records by month.");
    expect(markup).toContain("1,920 records completed");
    expect(markup).toMatch(/class="[^"]*\bcustom-widget\b/);
    expect(markup).toContain("bg-card");
  });

  it("renders optional actions and an alternate heading level", () => {
    const markup = render(
      createElement(DashboardWidget, {
        title: "Activity",
        headingLevel: 3,
        action: createElement("button", { type: "button" }, "View details"),
        children: "Content",
      }),
    );

    expect(markup).toContain("<h3");
    expect(markup).toContain("View details</button>");
    expect(markup).toContain("Content");
  });

  it("keeps a named loading layout and excludes stale children", () => {
    const markup = render(
      createElement(DashboardWidget, {
        title: "Activity",
        status: "loading",
        loadingLabel: "Loading activity",
        children: "Stale content",
      }),
    );

    expect(markup).toContain('data-state="loading"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("Loading activity");
    expect(markup).toContain('data-slot="dashboard-widget-loading"');
    expect(markup).toContain('data-slot="skeleton"');
    expect(markup).not.toContain("Stale content");
  });

  it("renders an empty state with a keyboard-ready action", () => {
    const markup = render(
      createElement(DashboardWidget, {
        title: "Activity",
        status: "empty",
        emptyTitle: "No activity yet",
        emptyDescription: "Activity will appear after the next update.",
        emptyAction: createElement(
          "button",
          { type: "button" },
          "View sources",
        ),
        children: "Stale content",
      }),
    );

    expect(markup).toContain('data-slot="dashboard-widget-empty"');
    expect(markup).toContain("No activity yet");
    expect(markup).toContain("View sources</button>");
    expect(markup).not.toContain("Stale content");
  });
});

describe("DashboardGrid", () => {
  it("renders mixed content in a responsive container with custom classes", () => {
    const markup = render(
      createElement(
        DashboardGrid,
        { className: "custom-grid" },
        createElement(
          DashboardGridItem,
          { className: "custom-item" },
          createElement(KpiCard, { label: "Open requests", value: "248" }),
        ),
        createElement(
          DashboardGridItem,
          { span: 2 },
          createElement(DashboardWidget, {
            title: "Activity",
            children: "Completed records",
          }),
        ),
      ),
    );

    expect(markup).toContain('data-slot="dashboard-grid"');
    expect(markup).toContain("@container/dashboard");
    expect(markup).toContain('data-slot="dashboard-grid-layout"');
    expect(markup).toContain("@min-[40rem]/dashboard:grid-cols-2");
    expect(markup).toContain("@min-[64rem]/dashboard:grid-cols-4");
    expect(markup).toContain('data-span="2"');
    expect(markup).toContain("Open requests");
    expect(markup).toContain("Completed records");
    expect(markup).toMatch(/class="[^"]*\bcustom-grid\b/);
    expect(markup).toMatch(/class="[^"]*\bcustom-item\b/);
  });

  it.each([
    [1, []],
    [
      2,
      [
        "@min-[40rem]/dashboard:col-span-2",
        "@min-[64rem]/dashboard:col-span-2",
      ],
    ],
    [
      3,
      [
        "@min-[40rem]/dashboard:col-span-2",
        "@min-[64rem]/dashboard:col-span-3",
      ],
    ],
    [
      4,
      [
        "@min-[40rem]/dashboard:col-span-2",
        "@min-[64rem]/dashboard:col-span-4",
      ],
    ],
  ] as const)("maps span %i to the available columns", (span, classes) => {
    const markup = render(
      createElement(DashboardGridItem, { span, children: "Content" }),
    );

    expect(markup).toContain(`data-span="${span}"`);
    for (const className of classes) expect(markup).toContain(className);
    if (span === 1) expect(markup).not.toContain("col-span-");
  });
});
