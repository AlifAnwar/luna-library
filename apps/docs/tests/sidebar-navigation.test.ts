import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarTrigger,
} from "@withalif/luna";

const render = (link: ComponentProps<typeof SidebarMenuLink>) =>
  renderToStaticMarkup(
    createElement(
      SidebarProvider,
      null,
      createElement(
        SidebarMenu,
        null,
        createElement(SidebarMenuItem, null, createElement(SidebarMenuLink, link)),
      ),
    ),
  );

describe("SidebarMenuLink", () => {
  it("renders a native navigation link with current-page semantics", () => {
    const markup = render({
      href: "/overview",
      label: "Overview",
      isActive: true,
      children: createElement("span", null, "Overview"),
      className: "custom-navigation-link",
      target: "_blank",
      rel: "noopener noreferrer",
    });

    expect(markup).toContain('data-slot="sidebar-menu-link"');
    expect(markup).toContain('href="/overview"');
    expect(markup).toContain('aria-label="Overview"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('data-active="true"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup).toMatch(/class="[^"]*custom-navigation-link/);
    expect(markup).not.toContain('role="button"');
  });

  it("leaves inactive links without current-page semantics", () => {
    const markup = render({ href: "/reports", label: "Reports", children: "Reports" });

    expect(markup).toContain('href="/reports"');
    expect(markup).not.toContain("aria-current");
    expect(markup).not.toContain('data-active="true"');
  });

  it("supports a consumer-supplied router link without a router dependency", () => {
    function RouterLink(props: ComponentProps<"a">) {
      return createElement("a", { ...props, "data-router-link": "" });
    }

    const markup = render({
      href: "/settings",
      label: "Settings",
      render: createElement(RouterLink),
      children: "Settings",
    });

    expect(markup).toContain('data-router-link=""');
    expect(markup).toContain('href="/settings"');
    expect(markup).toContain('aria-label="Settings"');
    expect(markup).toContain('data-slot="sidebar-menu-link"');
  });
});

describe("SidebarTrigger", () => {
  it("announces desktop disclosure state", () => {
    const collapsed = renderToStaticMarkup(
      createElement(
        SidebarProvider,
        { defaultOpen: false },
        createElement(SidebarTrigger),
      ),
    );
    const expanded = renderToStaticMarkup(
      createElement(SidebarProvider, null, createElement(SidebarTrigger)),
    );

    expect(collapsed).toContain('aria-expanded="false"');
    expect(collapsed).toContain('aria-label="Expand sidebar"');
    expect(expanded).toContain('aria-expanded="true"');
    expect(expanded).toContain('aria-label="Collapse sidebar"');
  });
});
