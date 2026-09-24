import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { MenuIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Badge } from "./badge";
import { buttonVariants } from "./button";
import { Separator } from "./separator";
import { Sheet, SheetContent, SheetTitle } from "./sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const MOBILE_BREAKPOINT = 768;

/**
 * SSR-safe media query hook scoped to Luna's mobile breakpoint (matches
 * Tailwind's default `md` breakpoint). Defaults to `false` until mounted so
 * server and first client render agree, then syncs via `matchMedia`.
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => setIsMobile(mql.matches);
    onChange();

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

type SidebarCollapsible = "offcanvas" | "icon" | "none";
type SidebarSide = "left" | "right";
type SidebarState = "expanded" | "collapsed";

type SidebarContextValue = {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
  collapsible: SidebarCollapsible;
  setCollapsible: React.Dispatch<React.SetStateAction<SidebarCollapsible>>;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar(componentName: string) {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error(`${componentName} must be used within SidebarProvider.`);
  }

  return context;
}

/**
 * True when the event originated in a control where the user is entering or
 * editing text, so a global shortcut must not claim the keystroke. Covers
 * native form controls and any `contenteditable` host (including a selection
 * inside one, which is why the closest `[contenteditable]` ancestor counts).
 */
function isEditingContext(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  if (target.isContentEditable) return true;
  if (target.closest("[contenteditable]:not([contenteditable='false'])")) {
    return true;
  }

  const tagName = target.tagName;

  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Opt in to the Cmd/Ctrl+B sidebar toggle. Off by default: Luna is a library,
   * and a global shortcut that calls `preventDefault()` would otherwise claim
   * the keystroke from every consuming application (Cmd+B is bold in any rich
   * text surface). Even when enabled, the shortcut stands down inside inputs,
   * textareas, selects and `contenteditable` regions.
   */
  keyboardShortcut?: boolean;
};

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  children,
  keyboardShortcut = false,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [collapsible, setCollapsible] =
    React.useState<SidebarCollapsible>("offcanvas");

  const open = openProp ?? internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      onOpenChange?.(value);

      if (openProp === undefined) {
        setInternalOpen(value);
      }
    },
    [onOpenChange, openProp],
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((value) => !value);
    } else {
      setOpen(!open);
    }
  }, [isMobile, open, setOpen]);

  React.useEffect(() => {
    if (!keyboardShortcut) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "b") return;
      if (!event.metaKey && !event.ctrlKey) return;
      if (event.altKey || event.shiftKey) return;
      if (isEditingContext(event.target)) return;

      event.preventDefault();
      toggleSidebar();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyboardShortcut, toggleSidebar]);

  const state: SidebarState = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      collapsible,
      setCollapsible,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar, collapsible],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-provider"
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full [--sidebar-width-icon:3rem] [--sidebar-width:16rem]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.ComponentProps<"div"> & {
  side?: SidebarSide;
  collapsible?: SidebarCollapsible;
  /**
   * Accessible name for the dialog the sidebar becomes below Luna's mobile
   * breakpoint. Rendered visually hidden, so it names the dialog for assistive
   * technology without altering the sidebar's own layout.
   */
  mobileTitle?: string;
};

function Sidebar({
  side = "left",
  collapsible = "offcanvas",
  className,
  children,
  mobileTitle = "Sidebar",
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile, setCollapsible } =
    useSidebar("Sidebar");

  React.useEffect(() => {
    setCollapsible(collapsible);
  }, [collapsible, setCollapsible]);

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        data-side={side}
        data-collapsible="none"
        className={cn(
          "flex h-svh w-(--sidebar-width) shrink-0 flex-col border-border bg-surface text-foreground",
          side === "left" ? "border-r" : "border-l",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-slot="sidebar"
          data-mobile="true"
          side={side}
          className="w-(--sidebar-width) gap-0 overflow-hidden bg-surface p-0 text-foreground"
        >
          <SheetTitle className="sr-only">{mobileTitle}</SheetTitle>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  const isOffcanvasCollapsed =
    state === "collapsed" && collapsible === "offcanvas";

  return (
    <div
      data-slot="sidebar"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : undefined}
      data-side={side}
      className={cn(
        "group/sidebar hidden h-svh shrink-0 flex-col border-border bg-surface text-foreground transition-[width] duration-200 ease-linear motion-reduce:transition-none md:flex",
        side === "right" && "order-1",
        side === "left" ? "border-r" : "border-l",
        state === "expanded" && "w-(--sidebar-width)",
        state === "collapsed" &&
          collapsible === "icon" &&
          "w-(--sidebar-width-icon)",
        isOffcanvasCollapsed && "w-0 overflow-hidden border-transparent",
        className,
      )}
      {...props}
    >
      {/*
       * `w-0 overflow-hidden` clips the off-canvas sidebar but leaves its
       * controls in the sequential focus order, so keyboard focus would
       * disappear into a zero-width region. `inert` removes the subtree from
       * focus and from the accessibility tree while leaving the outer width
       * transition untouched.
       */}
      <div
        data-slot="sidebar-content-wrapper"
        inert={isOffcanvasCollapsed}
        className="flex h-full w-full flex-col overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}

type SidebarTriggerProps = React.ComponentProps<"button"> & {
  label?: string;
};

function SidebarTrigger({
  className,
  label,
  onClick,
  children,
  ...props
}: SidebarTriggerProps) {
  const { isMobile, state, toggleSidebar } = useSidebar("SidebarTrigger");
  const accessibleLabel =
    label ??
    (isMobile
      ? "Toggle sidebar"
      : state === "expanded"
        ? "Collapse sidebar"
        : "Expand sidebar");

  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      aria-label={accessibleLabel}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {children ?? <MenuIcon aria-hidden="true" />}
      <span className="sr-only">{accessibleLabel}</span>
    </button>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex flex-col gap-2 p-3 group-data-[collapsible=icon]/sidebar:p-1.5",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The sidebar's scrolling navigation region. This is the part that carries the
 * menus, so this — rather than the whole sidebar shell, which also holds
 * branding in `SidebarHeader` and account controls in `SidebarFooter` — is what
 * gets the navigation landmark. Pass `aria-label` when a page renders more than
 * one, so each landmark is distinguishable.
 */
function SidebarContent({
  className,
  "aria-label": ariaLabel = "Sidebar",
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-content"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-3 group-data-[collapsible=icon]/sidebar:p-1.5",
        className,
      )}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "flex flex-col gap-2 p-3 group-data-[collapsible=icon]/sidebar:p-1.5",
        className,
      )}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      className={cn(
        "mx-3 my-2 w-auto group-data-[collapsible=icon]/sidebar:mx-1.5",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn(
        "relative flex w-full min-w-0 flex-col gap-1 p-3 group-data-[collapsible=icon]/sidebar:p-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "flex h-8 shrink-0 items-center px-2 text-caption font-medium text-muted-foreground uppercase tracking-wide transition-[margin,opacity] duration-200 motion-reduce:transition-none group-data-[collapsible=icon]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="sidebar-group-action"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-xs" }),
        "absolute top-3 right-3 group-data-[collapsible=icon]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("group/sidebar-menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/sidebar-menu-button flex h-control-md w-full items-center justify-start gap-2 overflow-hidden rounded-md px-2.5 text-left text-body font-medium text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:gap-0 group-data-[collapsible=icon]/sidebar:px-0 [&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4.5 [&>span:last-child]:truncate [&>span:last-child]:group-data-[collapsible=icon]/sidebar:hidden",
  {
    variants: {
      variant: {
        default:
          "hover:bg-muted hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        outline:
          "border border-border bg-background hover:bg-muted data-[active=true]:border-accent data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
      },
      size: {
        default: "",
        sm: "h-control-sm px-2 text-body-sm [&>svg:not([class*='size-'])]:size-4",
        lg: "h-control-lg px-3 text-body-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type SidebarMenuButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    isActive?: boolean;
    tooltip?: string | React.ReactNode;
  };

function SidebarMenuButton({
  className,
  variant = "default",
  size = "default",
  isActive = false,
  tooltip,
  type = "button",
  ...props
}: SidebarMenuButtonProps) {
  const { state, isMobile, collapsible } = useSidebar("SidebarMenuButton");

  const button = (
    <button
      type={type}
      data-slot="sidebar-menu-button"
      data-active={isActive || undefined}
      data-size={size}
      aria-current={isActive ? "page" : undefined}
      className={cn(sidebarMenuButtonVariants({ variant, size, className }))}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  const showTooltip =
    collapsible === "icon" && state === "collapsed" && !isMobile;

  if (!showTooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right" align="center">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="sidebar-menu-action"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-xs" }),
        "absolute top-1/2 right-1 -translate-y-1/2 group-data-[collapsible=icon]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      data-slot="sidebar-menu-badge"
      variant="secondary"
      className={cn(
        "pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 group-data-[collapsible=icon]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn(
        "ml-3.5 flex min-w-0 flex-col gap-1 border-l border-border px-2.5 py-0.5 group-data-[collapsible=icon]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      className={cn("group/sidebar-menu-item relative", className)}
      {...props}
    />
  );
}

type SidebarMenuSubButtonProps = React.ComponentProps<"button"> & {
  isActive?: boolean;
};

function SidebarMenuSubButton({
  className,
  isActive = false,
  type = "button",
  ...props
}: SidebarMenuSubButtonProps) {
  return (
    <button
      type={type}
      data-slot="sidebar-menu-sub-button"
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        sidebarMenuButtonVariants({ variant: "default", size: "sm" }),
        "h-7",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "flex min-w-0 flex-1 flex-col bg-background text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A permanent, icon-only primary navigation strip meant to sit alongside a
 * collapsible `Sidebar` (Notion/Linear-style two-tier layout). Unlike
 * `Sidebar`, it isn't tied to `SidebarProvider`'s open/collapse state and
 * stays visible whenever the desktop layout is shown; on narrow viewports it
 * hides entirely, same as `Sidebar`'s own desktop tree. Consuming apps that
 * want rail navigation on mobile too should compose their own layout for
 * that breakpoint.
 */
function SidebarRail({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-rail"
      aria-label="Primary"
      className={cn(
        "hidden h-svh w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-muted py-3 md:flex",
        className,
      )}
      {...props}
    />
  );
}

const sidebarRailItemClassName =
  "flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-background data-[active=true]:text-primary data-[active=true]:shadow-xs [&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-5";

type SidebarRailItemProps = React.ComponentProps<"button"> & {
  isActive?: boolean;
  tooltip: string | React.ReactNode;
};

function SidebarRailItem({
  "aria-label": ariaLabel,
  className,
  isActive = false,
  tooltip,
  type = "button",
  ...props
}: SidebarRailItemProps) {
  const button = (
    <button
      type={type}
      data-slot="sidebar-rail-item"
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      aria-label={
        ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined)
      }
      className={cn(sidebarRailItemClassName, className)}
      {...props}
    />
  );

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right" align="center">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
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
  sidebarMenuButtonVariants,
  type SidebarCollapsible,
  type SidebarMenuButtonProps,
  type SidebarProps,
  type SidebarProviderProps,
  type SidebarRailItemProps,
  type SidebarSide,
  type SidebarState,
};
