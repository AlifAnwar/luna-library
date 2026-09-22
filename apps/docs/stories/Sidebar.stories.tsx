import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  BellIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  FileIcon,
  HomeIcon,
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

function AppContent({ title }: { title: string }) {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="md:hidden" />
        <span className="text-body font-medium text-foreground">{title}</span>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="text-body text-muted-foreground">
          Main application content renders here, alongside the sidebar. On
          mobile, use the trigger button in this header to open the drawer; on
          desktop, use the collapse control inside the sidebar itself (or
          Cmd/Ctrl+B).
        </p>
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
            <SidebarTrigger
              className="hidden group-data-[collapsible=icon]/sidebar:rotate-180 md:inline-flex"
              label="Collapse sidebar"
            >
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
};

export const WithNestedItems: Story = {
  name: "With nested menu items",
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]/sidebar:flex-col">
            <AppLogo />
            <SidebarTrigger
              className="hidden group-data-[collapsible=icon]/sidebar:rotate-180 md:inline-flex"
              label="Collapse sidebar"
            >
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
            <SidebarTrigger
              className="group-data-[collapsible=icon]/sidebar:rotate-180"
              label="Collapse sidebar"
            >
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
