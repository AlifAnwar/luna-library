import type { ReactNode, SVGProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  BellIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  FileIcon,
  HomeIcon,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderHeading,
  SearchIcon,
  SettingsIcon,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarRail,
  SidebarRailItem,
  SidebarTrigger,
} from "@withalif/luna";

type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
};

const workspaceItems: readonly NavigationItem[] = [
  { href: "#app-main", label: "Overview", icon: HomeIcon },
  { href: "#reports", label: "Reports", icon: FileIcon },
  { href: "#settings", label: "Settings", icon: SettingsIcon },
];

const longLabelItems: readonly NavigationItem[] = [
  { href: "#app-main", label: "Overview", icon: HomeIcon },
  {
    href: "#reports",
    label: "Quarterly operational performance summary",
    icon: FileIcon,
  },
  {
    href: "#settings",
    label: "Workspace configuration and access settings",
    icon: SettingsIcon,
  },
];

function NavigationSidebar({
  collapsible = "icon",
  current,
  items,
  label = "Primary navigation",
}: {
  collapsible?: "icon" | "offcanvas";
  current: string;
  items: readonly NavigationItem[];
  label?: string;
}) {
  return (
    <Sidebar collapsible={collapsible} mobileTitle={label}>
      <SidebarHeader>
        <div className="flex min-w-0 items-center gap-2 px-2 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:px-0">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-label font-semibold text-primary-foreground"
          >
            L
          </span>
          <span className="min-w-0 break-words text-body font-semibold text-foreground group-data-[collapsible=icon]/sidebar:hidden">
            Luna Workspace
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent aria-label={label}>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ href, icon: Icon, label: itemLabel }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuLink
                    href={href}
                    label={itemLabel}
                    isActive={href === current}
                  >
                    <Icon aria-hidden="true" />
                    <span>{itemLabel}</span>
                  </SidebarMenuLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function ShellRecipe({
  children,
  defaultOpen = true,
  headerAction,
  rail,
  sidebar,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  headerAction?: ReactNode;
  rail?: ReactNode;
  sidebar: ReactNode;
  title: string;
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <a
        href="#app-main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-surface focus-visible:px-3 focus-visible:py-2 focus-visible:text-body focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Skip to content
      </a>
      {rail}
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
        <header className="flex min-h-14 min-w-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
          <SidebarTrigger className="shrink-0" />
          <span className="min-w-0 flex-1 break-words text-body font-semibold">
            {title}
          </span>
          {headerAction}
        </header>
        <main
          id="app-main"
          tabIndex={-1}
          className="min-w-0 flex-1 scroll-mt-16 px-4 py-6 sm:px-6"
        >
          <div className="mx-auto grid w-full max-w-5xl min-w-0 gap-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function OverviewContent({ long = false }: { long?: boolean }) {
  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderHeading className="break-words text-balance">
            {long
              ? "Quarterly operational performance across all participating workspaces"
              : "Overview"}
          </PageHeaderHeading>
          <PageHeaderDescription className="max-w-2xl break-words text-pretty">
            Review activity and open a section from the navigation.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">View updates</Button>
        </PageHeaderActions>
      </PageHeader>
      <Card>
        <CardContent className="grid min-h-40 place-content-center text-center text-body text-foreground-secondary">
          Application content is supplied by the consuming product.
        </CardContent>
      </Card>
    </>
  );
}

const meta = {
  title: "Patterns/ApplicationShell",
  component: SidebarProvider,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Composition recipe, not a new Luna export. Use SidebarProvider and Sidebar for disclosure, native links for destinations, and separate banner/main landmarks when the global header sits above page content. The application owns routes and active state.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SidebarProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ShellRecipe
      title="Luna Workspace"
      sidebar={<NavigationSidebar current="#app-main" items={workspaceItems} />}
    >
      <OverviewContent />
    </ShellRecipe>
  ),
};

export const CollapsedSidebar: Story = {
  render: () => (
    <ShellRecipe
      title="Luna Workspace"
      defaultOpen={false}
      sidebar={<NavigationSidebar current="#app-main" items={workspaceItems} />}
    >
      <OverviewContent />
    </ShellRecipe>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Expand sidebar" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await userEvent.click(trigger);
    await expect(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    ).toHaveAttribute("aria-expanded", "true");
  },
};

export const HeaderActionsAndBreadcrumb: Story = {
  render: () => (
    <ShellRecipe
      title="Workspace settings"
      headerAction={
        <Button size="sm" variant="outline">
          Open help
        </Button>
      }
      sidebar={<NavigationSidebar current="#settings" items={workspaceItems} />}
    >
      <PageHeader>
        <PageHeaderContent>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#app-main">Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PageHeaderHeading>Settings</PageHeaderHeading>
          <PageHeaderDescription>
            Configure the presentation of this workspace.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button>Save changes</Button>
        </PageHeaderActions>
      </PageHeader>
      <Card>
        <CardContent className="min-h-40 text-body text-foreground-secondary">
          Product settings and form state belong to the application.
        </CardContent>
      </Card>
    </ShellRecipe>
  ),
};

export const LongNavigationLabels: Story = {
  render: () => (
    <ShellRecipe
      title="Luna Workspace"
      sidebar={<NavigationSidebar current="#app-main" items={longLabelItems} />}
    >
      <OverviewContent long />
    </ShellRecipe>
  ),
  play: async ({ canvasElement }) => {
    for (const link of canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="sidebar-menu-link"]',
    )) {
      await expect(link.scrollHeight).toBeLessThanOrEqual(link.clientHeight);
    }
  },
};

export const TwoTierApplication: Story = {
  render: () => (
    <ShellRecipe
      title="Review workspace"
      rail={
        <SidebarRail aria-label="Quick actions">
          <SidebarRailItem tooltip="Search">
            <SearchIcon aria-hidden="true" />
          </SidebarRailItem>
          <SidebarRailItem tooltip="Notifications">
            <BellIcon aria-hidden="true" />
          </SidebarRailItem>
        </SidebarRail>
      }
      sidebar={
        <NavigationSidebar
          collapsible="offcanvas"
          current="#app-main"
          items={[
            { href: "#app-main", label: "Review queue", icon: HomeIcon },
            { href: "#history", label: "History", icon: FileIcon },
          ]}
          label="Sections"
        />
      }
    >
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderHeading>Review queue</PageHeaderHeading>
          <PageHeaderDescription>
            Navigate between sections using links supplied by the application.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <Card>
        <CardContent className="min-h-40 text-body text-foreground-secondary">
          This alternate shell has a quick-action rail and a separate section
          navigation surface.
        </CardContent>
      </Card>
    </ShellRecipe>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("navigation", { name: "Quick actions" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("navigation", { name: "Sections" }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole("main")).toHaveLength(1);
    await expect(canvas.getAllByRole("banner")).toHaveLength(1);
  },
};

export const NarrowViewport: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Resize the preview below 768 px: the sidebar becomes a named Sheet dialog, opened from the persistent header trigger. The banner, main content, and skip link remain in document order.",
      },
    },
  },
  render: () => (
    <ShellRecipe
      title="Luna Workspace"
      sidebar={<NavigationSidebar current="#app-main" items={workspaceItems} />}
    >
      <OverviewContent />
    </ShellRecipe>
  ),
};

export const KeyboardNavigation: Story = {
  render: () => (
    <ShellRecipe
      title="Luna Workspace"
      sidebar={<NavigationSidebar current="#app-main" items={workspaceItems} />}
    >
      <OverviewContent />
    </ShellRecipe>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skipLink = canvas.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toHaveAttribute("href", "#app-main");
    await expect(canvas.getByRole("main")).toHaveAttribute("id", "app-main");
    skipLink.focus();
    await expect(skipLink).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveFocus();
  },
};
