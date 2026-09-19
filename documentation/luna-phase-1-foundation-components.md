# Luna Roadmap — Phase 1: Foundation Components

## Objective

Build the first complete set of reusable foundation components for `@withalif/luna`.

Phase 1 focuses only on low-level UI building blocks used across enterprise apps such as ERP, HRIS, WMS, CRM, finance, inventory, workforce, operational dashboards, and internal admin portals.

Do **not** build business-specific components yet.

---

## Current Luna Stack

- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui source components
- Base UI primitives
- Nova preset
- Storybook
- pnpm workspace
- Turborepo

Package:

```text
@withalif/luna
```

Existing foundations:

```text
Color System v1
Typography
Radius
Density / Spacing
Shadow
```

Existing components:

```text
Button
Card
Checkbox
Dialog
Select
```

Component source:

```text
packages/ui/src/components/ui/
```

Storybook stories:

```text
apps/docs/stories/
```

---

# Phase 1 Scope

## Existing

```text
Button
Card
Checkbox
Dialog
Select
```

## Add

```text
Input
Textarea
Badge
Switch
Radio Group
Tooltip
Popover
Dropdown Menu
Tabs
Skeleton
Alert
Toast
Separator
Avatar
Progress
```

Target: **20 foundation components total**.

---

# Component Groups

## Actions

```text
Button
Dropdown Menu
```

## Forms / Controls

```text
Input
Textarea
Select
Checkbox
Radio Group
Switch
```

These must stay presentation-focused.

Do not couple them to:

```text
Zod
Redux
React Hook Form
APIs
business validation
```

Apps consuming Luna should decide how form state and validation work.

## Data / Content Display

```text
Card
Badge
Avatar
Progress
Skeleton
Separator
```

## Overlays

```text
Dialog
Tooltip
Popover
```

Preserve Base UI accessibility and focus behavior.

## Navigation / Organization

```text
Tabs
```

Do not couple Tabs to Next.js routing.

## Feedback

```text
Alert
Toast
Skeleton
Progress
```

---

# Design Requirements

## Color

Use Luna semantic tokens:

```text
bg-primary
text-primary-foreground
bg-secondary
text-secondary-foreground
bg-muted
text-muted-foreground
bg-destructive
text-destructive-foreground
border-border
ring-ring
```

Avoid hardcoded decorative colors such as:

```text
bg-blue-500
text-green-500
border-red-400
```

## Typography

Typical controls:

```text
14px / 500
```

Compact controls may use:

```text
13px / 500
```

Do not introduce component-specific font families.

## Radius

Preferred mapping:

```text
Button       8px
Input        8px
Textarea     8px
Select       8px
Checkbox     6px
Radio        circular
Switch       full
Badge        6px
Card         10px
Dialog       12px
Popover      10px
Tooltip      6px
Dropdown     10px
Tabs         8px where applicable
Alert        8–10px
Toast        10px
```

## Density

Default control height:

```text
36px
```

Compact:

```text
32px
```

Large:

```text
40px
```

Luna should remain compact-medium and suitable for enterprise applications.

---

# Implementation Rules

Use shadcn as the source foundation when a matching component exists.

Run generation from:

```bash
cd packages/ui
```

Examples:

```bash
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add badge
```

Generated components must live in:

```text
packages/ui/src/components/ui/
```

Do not generate Luna components inside:

```text
apps/web
apps/docs
```

---

# Required Components

## Button

Already exists.

Verify variants:

```text
Primary
Secondary
Outline
Destructive
Ghost
```

Recommended sizes:

```text
sm
default
lg
icon
```

## Card

Already exists.

Verify:

```text
Card
CardHeader
CardTitle
CardDescription
CardContent
CardFooter
```

## Input

Requirements:

- default height 36px
- Luna border
- Luna focus ring
- disabled state
- placeholder styling
- invalid state if cleanly supported
- semantic tokens only

## Textarea

Requirements:

- consistent with Input
- practical minimum height
- disabled state
- focus state
- sensible resize behavior

## Select

Already exists.

Verify:

- 36px default height
- placeholder
- disabled
- keyboard navigation
- scrollable content
- selected state

## Checkbox

Already exists.

Verify:

- checked
- indeterminate if supported
- disabled
- visible focus

## Radio Group

Add:

```text
RadioGroup
RadioGroupItem
```

Requirements:

- keyboard accessible
- disabled state
- Luna focus/color tokens

## Switch

Requirements:

- checked
- unchecked
- disabled
- visible focus

## Badge

Recommended variants:

```text
default
secondary
outline
destructive
```

Do **not** build enterprise `StatusBadge` yet.

## Avatar

Add:

```text
Avatar
AvatarImage
AvatarFallback
```

Requirements:

- image
- fallback initials
- practical sizes if cleanly supported

## Tooltip

Add:

```text
Tooltip
TooltipTrigger
TooltipContent
```

Requirements:

- keyboard accessible
- hover/focus behavior
- restrained shadow
- compact typography

## Popover

Add:

```text
Popover
PopoverTrigger
PopoverContent
```

Requirements:

- Luna surface/border
- restrained shadow
- accessible dismissal

## Dropdown Menu

Add the complete practical source set:

```text
DropdownMenu
DropdownMenuTrigger
DropdownMenuContent
DropdownMenuItem
DropdownMenuCheckboxItem
DropdownMenuRadioItem
DropdownMenuLabel
DropdownMenuSeparator
```

This will later support DataTable, bulk actions, user menus, filters, and column visibility.

## Tabs

Add:

```text
Tabs
TabsList
TabsTrigger
TabsContent
```

Requirements:

- enterprise-neutral style
- accessible focus
- clear active state

## Separator

Requirements:

- horizontal
- vertical if cleanly supported
- subtle border token

## Skeleton

Requirements:

- Luna muted surface
- subtle loading visual
- avoid excessive animation

## Alert

Add:

```text
Alert
AlertTitle
AlertDescription
```

At minimum:

```text
default
destructive
```

Success/warning/info variants may be added only if generic and clean.

## Progress

Requirements:

- primary semantic color
- neutral track
- accessible value semantics

## Toast

Use the current shadcn-compatible notification approach.

Requirements:

- default/info
- success
- destructive/error
- optional description
- dismiss behavior
- Luna typography/radius/shadow

Do not create a Redux-powered toast store.

---

# Public API

Export all consumer-facing Phase 1 components through:

```text
packages/ui/src/index.ts
```

Consumers should be able to write:

```tsx
import {
  Button,
  Card,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
  Badge,
  Avatar,
  Tooltip,
  Popover,
  DropdownMenu,
  Tabs,
  Separator,
  Skeleton,
  Alert,
  Progress,
} from "@withalif/luna";
```

Avoid requiring internal paths such as:

```text
@withalif/luna/components/ui/button
```

---

# Storybook Requirements

Every Phase 1 component needs a story in:

```text
apps/docs/stories/
```

Recommended structure:

```text
Button.stories.tsx
Card.stories.tsx
Input.stories.tsx
Textarea.stories.tsx
Select.stories.tsx
Checkbox.stories.tsx
RadioGroup.stories.tsx
Switch.stories.tsx
Badge.stories.tsx
Avatar.stories.tsx
Tooltip.stories.tsx
Popover.stories.tsx
DropdownMenu.stories.tsx
Tabs.stories.tsx
Separator.stories.tsx
Skeleton.stories.tsx
Alert.stories.tsx
Progress.stories.tsx
Toast.stories.tsx
```

Use titles:

```text
Luna/Button
Luna/Input
Luna/Select
Luna/Dialog
```

Never use:

```text
Example/*
```

Useful story states only.

Examples:

```text
Input: Default, Placeholder, Disabled, Invalid
Button: Primary, Secondary, Outline, Destructive, Ghost, Sizes, Disabled
Badge: Default, Secondary, Outline, Destructive
Dialog: Default, Long Content
```

---

# Accessibility

Preserve:

```text
Keyboard navigation
Focus visibility
Disabled states
ARIA behavior
Readable contrast
Screen-reader semantics
```

Use Storybook accessibility checks.

Do not remove Base UI accessibility behavior.

---

# Dependency Rules

## Allowed inside Luna

```text
React
Base UI
Tailwind CSS
shadcn-generated dependencies
Lucide icons where needed
Motion only when a concrete Luna component genuinely requires custom animation
```

Do not install Motion preemptively.

## Keep outside Luna core

```text
Redux Toolkit
Zod
React Hook Form
TanStack Query
API clients
business schemas
business state
authentication state
```

These belong to consuming applications.

---

# Architecture Principle

Luna should receive state through props.

Good:

```tsx
<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

Good:

```tsx
<Select
  value={status}
  onValueChange={setStatus}
/>
```

Preferred flow:

```text
Application State
      ↓
    props
      ↓
Luna Component
      ↓
 callbacks
      ↓
Application
```

---

# Explicitly Out of Phase 1

Do **not** build these yet:

```text
DataTable
Advanced Filter
Filter Bar
Date Picker
Date Range Picker
Combobox
Multi Select
Pagination
Sidebar
Breadcrumb
KPI Card
Status Badge
Approval Timeline
Activity Log
Audit Log
Bulk Action Bar
User Selector
Role Selector
Permission Matrix
Entity Picker
Charts
Dashboard layouts
```

---

# Validation

From repository root:

```bash
pnpm run check-types
pnpm run lint
pnpm run build
```

UI package:

```bash
cd packages/ui
pnpm run check-types
```

Storybook:

```bash
cd apps/docs
pnpm run storybook
```

Verify every Phase 1 component renders correctly.

---

# Completion Criteria

Phase 1 is complete only when:

- all scoped components exist
- public components are exported from `@withalif/luna`
- all components follow Luna tokens
- all components have useful Storybook stories
- no `Example/*` samples remain
- TypeScript passes
- lint passes
- production build passes
- Storybook launches without blocking errors
- no Redux/Zod/business logic is coupled into Luna
- existing component APIs remain compatible unless documented otherwise

---

# Expected Result

```text
@withalif/luna
│
├── Foundations
│   ├── Color
│   ├── Typography
│   ├── Radius
│   ├── Density
│   └── Shadow
│
└── Foundation Components
    ├── Button
    ├── Card
    ├── Input
    ├── Textarea
    ├── Select
    ├── Checkbox
    ├── Radio Group
    ├── Switch
    ├── Badge
    ├── Avatar
    ├── Dialog
    ├── Tooltip
    ├── Popover
    ├── Dropdown Menu
    ├── Tabs
    ├── Separator
    ├── Skeleton
    ├── Alert
    ├── Progress
    └── Toast
```

After Phase 1 is complete and validated, move to **Phase 2: Forms + Navigation**.

---

# Final Agent Report

When finished, report:

1. Components added
2. Existing components changed
3. Files created
4. Public exports added
5. Stories created
6. Dependencies added and why
7. Whether `pnpm run check-types` passes
8. Whether `pnpm run lint` passes
9. Whether `pnpm run build` passes
10. Whether Storybook launches successfully
11. Accessibility issues found
12. Warnings or remaining issues
13. Components deliberately deferred and why

Do not claim a validation command passes unless it was actually run successfully.
