import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { shouldRunStoryPlay } from "./story-play";
import {
  BellIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  FileIcon,
  HomeIcon,
  Input,
  Label,
  SearchIcon,
  SettingsIcon,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarRailItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@withalif/luna";

// The off-canvas mobile drawer (rendered inside Luna's Sheet below the `md`
// breakpoint) is driven by a live `matchMedia` check inside SidebarProvider,
// so it can't be demonstrated meaningfully inside Storybook's fixed-size
// iframe. Resize your browser below 768px to see it take over. `SidebarRail`
// is desktop-only for the same reason and hides at that breakpoint too.

const meta: Meta<typeof Sidebar> = {
  title: "Luna/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof meta>;

function AppLogo() {
  return (
    <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]/sidebar:px-0">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-label font-semibold text-primary-foreground">
        L
      </span>
      <span className="text-body font-semibold text-foreground group-data-[collapsible=icon]/sidebar:hidden">
        Luna App
      </span>
    </div>
  );
}

function AppUser() {
  return (
    <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]/sidebar:px-0">
      <span
        aria-hidden="true"
        className="size-8 shrink-0 rounded-full bg-muted"
      />
      <div className="flex flex-col group-data-[collapsible=icon]/sidebar:hidden">
        <span className="text-body-sm font-medium text-foreground">
          Jordan Lee
        </span>
        <span className="text-caption text-muted-foreground">
          jordan@example.com
        </span>
      </div>
    </div>
  );
}

function AppContent({
  title,
  children,
  /**
   * Keep the trigger visible on desktop too. An `offcanvas` sidebar collapses
   * to zero width and its own contents become inert, so the control that
   * reopens it has to live outside the sidebar.
   */
  persistentTrigger = false,
}: {
  title: string;
  children?: ReactNode;
  persistentTrigger?: boolean;
}) {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger
          className={persistentTrigger ? undefined : "md:hidden"}
          label="Toggle sidebar"
        />
        <span className="text-body font-medium text-foreground">{title}</span>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="text-body text-muted-foreground">
          Main application content renders here, alongside the sidebar. On
          mobile, use the trigger button in this header to open the drawer; on
          desktop, use the collapse control inside the sidebar itself.
        </p>
        {children}
      </div>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]/sidebar:flex-col">
            <AppLogo />
            <SidebarTrigger className="hidden group-data-[collapsible=icon]/sidebar:rotate-180 md:flex">
              <ChevronLeftIcon aria-hidden="true" />
            </SidebarTrigger>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Overview">
                    <CheckCircleIcon />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Reports">
                    <FileIcon />
                    <span>Reports</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Search">
                    <SearchIcon />
                    <span>Search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Team">
                    <SettingsIcon />
                    <span>Team</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <AppUser />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppContent title="Overview" />
      </SidebarInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: "Expand sidebar" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    ).toBeInTheDocument();
  },
};

export const StickyDuringDocumentScroll: Story = {
  name: "Sticky during document scroll",
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent aria-label="Workspace">
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <CheckCircleIcon />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <AppContent title="Long workspace">
          <div className="min-h-[200svh] text-body text-muted-foreground">
            Long application content keeps the document scrollable while the
            desktop sidebar remains pinned to the viewport.
          </div>
        </AppContent>
      </SidebarInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const sidebar = canvasElement.querySelector<HTMLElement>(
      '[data-slot="sidebar"]',
    );

    await expect(sidebar).not.toBeNull();
    await expect(getComputedStyle(sidebar!).position).toBe("sticky");

    window.scrollTo({ top: document.documentElement.scrollHeight });
    await waitFor(() =>
      expect(Math.round(sidebar!.getBoundingClientRect().top)).toBe(0),
    );
    window.scrollTo({ top: 0 });
  },
};

export const WithNestedItems: Story = {
  name: "With nested menu items",
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]/sidebar:flex-col">
            <AppLogo />
            <SidebarTrigger className="hidden group-data-[collapsible=icon]/sidebar:rotate-180 md:flex">
              <ChevronLeftIcon aria-hidden="true" />
            </SidebarTrigger>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Overview">
                    <CheckCircleIcon />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Reports">
                    <FileIcon />
                    <span>Reports</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive>
                        Monthly
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Quarterly</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Annual</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <SettingsIcon />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <AppUser />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppContent title="Reports" />
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const TwoTierWithRail: Story = {
  name: "Two-tier: icon rail + collapsible panel",
  render: () => (
    <SidebarProvider>
      <SidebarRail>
        <SidebarRailItem isActive tooltip="Home">
          <HomeIcon aria-hidden="true" />
        </SidebarRailItem>
        <SidebarRailItem tooltip="Search">
          <SearchIcon aria-hidden="true" />
        </SidebarRailItem>
        <SidebarRailItem tooltip="Notifications">
          <BellIcon aria-hidden="true" />
        </SidebarRailItem>
        <SidebarRailItem tooltip="Settings">
          <SettingsIcon aria-hidden="true" />
        </SidebarRailItem>
      </SidebarRail>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]/sidebar:flex-col">
            <AppLogo />
            <SidebarTrigger className="group-data-[collapsible=icon]/sidebar:rotate-180">
              <ChevronLeftIcon aria-hidden="true" />
            </SidebarTrigger>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Overview">
                    <CheckCircleIcon />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Reports">
                    <FileIcon />
                    <span>Reports</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <AppUser />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppContent title="Overview" />
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const OffcanvasCollapse: Story = {
  name: "Off-canvas collapse (focus + opt-in shortcut)",
  // Requires a viewport above Luna's `md` breakpoint: below it the provider
  // swaps the desktop sidebar for the mobile Sheet, so there is no collapsed
  // region to assert on. The Vitest runner's viewport is set in
  // `vitest.config.ts`.
  parameters: {
    docs: {
      description: {
        story:
          "The default `offcanvas` collapse hides the sidebar by animating its " +
          "width to zero. Collapse it with the header control, then press Tab " +
          "from the main content: focus moves straight through to the page, " +
          "because the collapsed region is marked `inert` rather than merely " +
          'clipped. The active item carries `aria-current="page"`, and the ' +
          "navigation region is a `<nav>` landmark while the header and footer " +
          "stay outside it.\n\n" +
          "This story also opts into the Cmd/Ctrl+B toggle via " +
          "`keyboardShortcut`. It is off by default so Luna never claims the " +
          "keystroke from a consuming app, and even when enabled it stands " +
          "down while you are typing — try it from inside the field below.",
      },
    },
  },
  render: () => (
    <SidebarProvider keyboardShortcut>
      <Sidebar collapsible="offcanvas" mobileTitle="Workspace navigation">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2">
            <AppLogo />
            <SidebarTrigger className="hidden md:flex">
              <ChevronLeftIcon aria-hidden="true" />
            </SidebarTrigger>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent aria-label="Workspace">
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <CheckCircleIcon />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileIcon />
                    <span>Reports</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <SettingsIcon />
                    <span>Team</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <AppUser />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppContent title="Overview" persistentTrigger>
          <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="shortcut-probe">Shortcut stand-down check</Label>
            <Input
              id="shortcut-probe"
              placeholder="Press Cmd/Ctrl+B while focused here"
            />
            <p className="text-body-sm text-muted-foreground">
              The sidebar must not toggle while this field has focus.
            </p>
          </div>
        </AppContent>
      </SidebarInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunStoryPlay()) return;
    const canvas = within(canvasElement);

    // The navigation landmark covers the menus only, and is named.
    const nav = canvas.getByRole("navigation", { name: "Workspace" });
    await expect(nav).toBeInTheDocument();

    // The current page is exposed programmatically, not by colour alone.
    const overview = canvas.getByRole("button", { name: "Overview" });
    await expect(overview).toHaveAttribute("aria-current", "page");
    await expect(
      canvas.getByRole("button", { name: "Reports" }),
    ).not.toHaveAttribute("aria-current");

    // Collapsing off-canvas takes the whole sidebar out of the focus order.
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse sidebar" }),
    );

    const wrapper = canvasElement.querySelector(
      '[data-slot="sidebar-content-wrapper"]',
    );
    await waitFor(() => expect(wrapper).toHaveAttribute("inert"));

    // Tabbing from the main content must never land inside the hidden sidebar.
    const toggle = canvas.getAllByRole("button", { name: "Toggle sidebar" })[0];
    toggle?.focus();
    await userEvent.tab();
    await expect(wrapper?.contains(document.activeElement)).toBe(false);

    // The shortcut is opted into here, but stands down while typing.
    const field = canvas.getByLabelText("Shortcut stand-down check");
    await userEvent.click(field);
    await userEvent.keyboard("{Control>}b{/Control}");
    await expect(wrapper).toHaveAttribute("inert");

    // Outside an editing context it toggles, reopening the sidebar.
    toggle?.focus();
    await userEvent.keyboard("{Control>}b{/Control}");
    await waitFor(() => expect(wrapper).not.toHaveAttribute("inert"));
  },
};
