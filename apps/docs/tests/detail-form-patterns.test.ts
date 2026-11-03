import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DetailField, DetailList } from "@withalif/luna";

const render = (component: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(component);

describe("DetailList", () => {
  it("renders native description-list semantics and responsive columns", () => {
    const markup = render(
      createElement(
        DetailList,
        { columns: 3, className: "custom-list", "aria-label": "Record" },
        createElement(DetailField, { label: "Record ID" }, "REC-1042"),
        createElement(DetailField, { label: "Status" }, "Active"),
      ),
    );

    expect(markup).toContain("<dl");
    expect(markup).toContain('data-slot="detail-list"');
    expect(markup).toContain('data-columns="3"');
    expect(markup).toContain('aria-label="Record"');
    expect(markup).toContain('data-slot="detail-list-container"');
    expect(markup).toContain("@container/detail-list");
    expect(markup).toContain("@min-[52rem]/detail-list:grid-cols-3");
    expect(markup).toMatch(/class="[^"]*\bcustom-list\b/);
  });

  it("supports compact density", () => {
    const markup = render(createElement(DetailList, { density: "compact" }));

    expect(markup).toContain('data-density="compact"');
    expect(markup).toContain("data-[density=compact]:gap-y-3");
  });
});

describe("DetailField", () => {
  it("renders a label and arbitrary read-only value", () => {
    const markup = render(
      createElement(
        DetailField,
        { label: "Contact email", className: "custom-field" },
        createElement(
          "a",
          { href: "mailto:ops@example.com" },
          "ops@example.com",
        ),
      ),
    );

    expect(markup).toContain("<dt");
    expect(markup).toContain("Contact email</dt>");
    expect(markup).toContain("<dd");
    expect(markup).toContain('href="mailto:ops@example.com"');
    expect(markup).toMatch(/class="[^"]*\bcustom-field\b/);
  });

  it("renders overridable empty copy and full-row spanning", () => {
    const markup = render(
      createElement(DetailField, {
        label: "Secondary contact",
        emptyValue: "None assigned",
        span: "full",
      }),
    );

    expect(markup).toContain('data-empty="true"');
    expect(markup).toContain('data-span="full"');
    expect(markup).toContain("col-span-full");
    expect(markup).toContain("None assigned");
  });

  it("preserves numeric zero as a value", () => {
    const markup = render(
      createElement(DetailField, { label: "Open issues" }, 0),
    );

    expect(markup).not.toContain('data-empty="true"');
    expect(markup).toContain(">0</dd>");
  });
});
