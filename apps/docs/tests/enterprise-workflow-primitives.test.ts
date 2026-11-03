import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ActivityLog,
  ActivityLogItem,
  ApprovalTimeline,
  ApprovalTimelineItem,
  CheckIcon,
} from "@withalif/luna";

const render = (component: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(component);

describe("ActivityLog", () => {
  it("renders chronological ordered-list semantics through the public API", () => {
    const markup = render(
      createElement(
        ActivityLog,
        { "aria-label": "Record activity", className: "custom-log" },
        createElement(
          ActivityLogItem,
          {
            title: "Maya Chen updated the record",
            timestamp: createElement(
              "time",
              { dateTime: "2026-11-03T09:24:00+07:00" },
              "09:24",
            ),
            marker: createElement(CheckIcon),
            className: "custom-event",
          },
          "Changed the primary region.",
        ),
      ),
    );

    expect(markup).toContain("<ol");
    expect(markup).toContain('data-slot="activity-log"');
    expect(markup).toContain('aria-label="Record activity"');
    expect(markup).toContain("<li");
    expect(markup).toContain('data-slot="activity-log-item"');
    expect(markup).toContain('dateTime="2026-11-03T09:24:00+07:00"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("Changed the primary region.");
    expect(markup).toMatch(/class="[^"]*\bcustom-log\b/);
    expect(markup).toMatch(/class="[^"]*\bcustom-event\b/);
  });

  it("supports an event without optional detail content", () => {
    const markup = render(
      createElement(
        ActivityLog,
        null,
        createElement(ActivityLogItem, {
          title: "Automated review completed",
          timestamp: "Yesterday",
        }),
      ),
    );

    expect(markup).not.toContain('data-slot="activity-log-description"');
    expect(markup).toContain("Automated review completed");
  });
});

describe("ApprovalTimeline", () => {
  it("renders visible consumer-provided state without deriving workflow logic", () => {
    const markup = render(
      createElement(
        ApprovalTimeline,
        { "aria-label": "Approval history", className: "custom-timeline" },
        createElement(
          ApprovalTimelineItem,
          {
            title: "Finance review",
            status: "In review",
            tone: "info",
            marker: createElement(CheckIcon),
            meta: "Finance team · 3 Nov 2026",
            "aria-current": "step",
            className: "custom-step",
          },
          "Reviewing the supplied record.",
        ),
      ),
    );

    expect(markup).toContain("<ol");
    expect(markup).toContain('data-slot="approval-timeline"');
    expect(markup).toContain('aria-label="Approval history"');
    expect(markup).toContain('data-tone="info"');
    expect(markup).toContain('aria-current="step"');
    expect(markup).toContain('data-slot="approval-timeline-status"');
    expect(markup).toContain("In review");
    expect(markup).toContain("Finance team · 3 Nov 2026");
    expect(markup).toContain("Reviewing the supplied record.");
    expect(markup).toMatch(/class="[^"]*\bcustom-timeline\b/);
    expect(markup).toMatch(/class="[^"]*\bcustom-step\b/);
  });

  it("uses neutral presentation and a decorative marker by default", () => {
    const markup = render(
      createElement(
        ApprovalTimeline,
        null,
        createElement(ApprovalTimelineItem, {
          title: "Final confirmation",
          status: "Not started",
        }),
      ),
    );

    expect(markup).toContain('data-tone="neutral"');
    expect(markup).toContain('data-slot="approval-timeline-marker"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("Not started");
  });
});
