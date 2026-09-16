# Agent Task — Implement Luna Foundations v1

You are working inside the existing healthy **pnpm + Turborepo** monorepo named `luna-library`.

This task continues the Luna design-system foundation after **Luna Color System v1**.

---

# Current Context

Luna is an internal React design system for enterprise dashboards and management applications.

Relevant stack:

- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Base UI
- Nova preset
- pnpm workspace
- Turborepo

Package:

```text
@withalif/luna
```

Relevant structure:

```text
packages/ui/
├── components.json
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── src/
    ├── components/
    │   └── ui/
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── checkbox.tsx
    │       ├── dialog.tsx
    │       └── select.tsx
    ├── lib/
    │   └── utils.ts
    ├── styles/
    │   └── globals.css
    └── index.ts
```

`apps/web` is the consumer test application.

Luna Color System v1 is already implemented and working.

---

# Goal

Implement **Luna Foundations v1** covering:

1. Typography
2. Border radius
3. UI density / spacing
4. Minimal shadow standards

The result should make Luna feel more intentional and less like untouched shadcn/Nova defaults.

Visual direction:

> Modern enterprise SaaS — clean, calm, professional, compact-medium density, readable, data-friendly, and reusable across ERP / WMS / HRIS / CRM / finance / operational dashboards.

---

# 1. Typography System

## Font Families

Primary UI font:

```text
Inter
```

Monospace font:

```text
Geist Mono
```

Preferred token intent:

```css
--font-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "Geist Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

Important:

- Do not embed or commit font files manually.
- Do not add random external CDN imports.
- If the project already has a safe existing font-loading mechanism, preserve it.
- The design-system package should define the intended font stacks without tightly coupling Luna to Next.js-specific font APIs.
- Do not introduce unnecessary font dependencies unless strictly required.

## Font Loading Contract

For v1, the Luna package owns the **font-family tokens**, not font delivery.

- Define `Inter` as the preferred family in the Luna stack.
- Do not claim that Inter is rendered unless a consumer actually loads it.
- If Inter is not already available, the stack must fall back cleanly to the
  system UI font without layout breakage.
- `apps/web` may keep its existing safe local-font mechanism for the visual
  test, but it must not redefine or override Luna's typography scale.
- Do not add `next/font` usage inside `packages/ui`; Luna must remain
  framework-agnostic.

This separation is intentional:

```text
Luna package     -> declares typography intent and fallback stacks
Consumer app     -> optionally provides the actual font asset
```

---

# Typography Scale

Use a compact enterprise-friendly scale.

```text
caption      12px
label        13px
body-sm      13px
body         14px
body-lg      16px
card-title   16px
section      18px
heading-sm   20px
heading      24px
page-title   28px
display      32px
```

Recommended line heights:

```text
12px -> 16px
13px -> 18px
14px -> 20px
16px -> 24px
18px -> 26px
20px -> 28px
24px -> 32px
28px -> 36px
32px -> 40px
```

Recommended weights:

```text
400 Regular
500 Medium
600 Semibold
700 Bold
```

Usage guidance:

```text
Display / KPI hero       32px / 700
Page title               28px / 700
Main heading             24px / 600
Section title            18–20px / 600
Card title               16px / 600
Body                     14px / 400
Label                    13px / 500
Table                    13–14px / 400–500
Caption / helper         12px / 400
```

For numeric KPI and tabular data, enable tabular numerals where practical:

```css
font-variant-numeric: tabular-nums;
```

Do not force tabular numerals globally if it harms normal text.

---

# Typography Tokens

Prefer semantic CSS variables rather than component-local hardcoded values.

Suggested token shape:

```css
--font-size-caption: 0.75rem;
--font-size-label: 0.8125rem;
--font-size-body-sm: 0.8125rem;
--font-size-body: 0.875rem;
--font-size-body-lg: 1rem;
--font-size-card-title: 1rem;
--font-size-section: 1.125rem;
--font-size-heading-sm: 1.25rem;
--font-size-heading: 1.5rem;
--font-size-page-title: 1.75rem;
--font-size-display: 2rem;
```

Add corresponding line-height tokens.

Because the project uses Tailwind v4, expose the scale through `@theme inline`
using Tailwind's native token names so utilities are actually generated. The
expected utility contract is:

```text
font-sans
font-mono
text-caption
text-label
text-body-sm
text-body
text-body-lg
text-card-title
text-section
text-heading-sm
text-heading
text-page-title
text-display
```

Use `--text-*` plus `--text-*--line-height` mappings in `@theme inline`, backed
by the semantic variables above. Do not create component-local font-size
values when one of these tokens already matches.

`label` and `body-sm` intentionally share a size and line height; they differ
by semantic usage and recommended weight, not geometry.

---

# 2. Border Radius System

Luna should feel modern but not playful.

Target character:

```text
medium radius
subtle rounding
not pill-heavy
not overly soft
```

Use this radius scale:

```text
radius-xs   4px
radius-sm   6px
radius-md   8px
radius-lg   10px
radius-xl   12px
radius-full 9999px
```

Recommended component mapping:

```text
Button       8px
Input        8px
Select       8px
Checkbox     6px
Card        10px
Dialog      12px
Popover     10px
Badge       6px
Tooltip     6px
```

Preserve compatibility with existing shadcn variables such as:

```text
--radius
--radius-sm
--radius-md
--radius-lg
```

Adjust mappings cleanly rather than hardcoding every component independently.

Use the following explicit Tailwind/component mapping to avoid ambiguity with
the current Nova classes:

```text
rounded-xs   -> 4px
rounded-sm   -> 6px   -> checkbox / badge / tooltip
rounded-md   -> 8px   -> button / input / select
rounded-lg   -> 10px  -> card / popover
rounded-xl   -> 12px  -> dialog
rounded-full -> 9999px
```

Set the shadcn base `--radius` to `8px`, while exposing the exact scale through
Tailwind v4 radius tokens. Prefer changing an existing component's radius
utility (`rounded-lg` to `rounded-md`, for example) over making a misleading
global remap where `rounded-lg` no longer means 10px.

Do not turn normal buttons into full pills.

---

# 3. Density / Spacing System

Luna should use **compact-medium density**.

It should support enterprise UIs where many controls and data rows must fit on screen without feeling cramped.

Target control heights:

```text
Control XS       28px
Control SM       32px
Control MD       36px
Control LG       40px
```

Default control height:

```text
36px
```

Map the existing component size APIs explicitly:

```text
xs / icon-xs       28px
sm / icon-sm       32px
default / icon     36px
lg / icon-lg       40px
```

Do not remove or rename existing size variants. Compact sizes are intended for
dense desktop toolbars and tables; default or large sizes should be preferred
for touch-heavy contexts.

Recommended usage:

```text
Button default       36px
Input default        36px
Select default       36px
Compact toolbar      32px
Large CTA            40px
Table row compact    36px
Table row default    40px
```

Spacing scale:

```text
space-1   4px
space-2   8px
space-3   12px
space-4   16px
space-5   20px
space-6   24px
space-8   32px
space-10  40px
space-12  48px
```

Common component spacing:

```text
Button horizontal padding     12–16px
Input horizontal padding      12px
Form field gap                8px
Form group gap                16px
Card internal padding         16–20px
Card section gap              16px
Page section gap              24–32px
Toolbar gap                   8px
Table cell horizontal pad     12px
```

Use existing Tailwind spacing values when they already match.

Do not create redundant CSS variables for every Tailwind spacing step unless Luna needs a semantic alias.

Prefer semantic density tokens only where they add value, for example:

```text
--control-height-sm
--control-height-md
--control-height-lg
--table-row-height
--card-padding
```

---

# 4. Shadow System

Keep shadows very restrained.

Luna should rely more on:

- borders
- surface contrast
- hierarchy

than heavy shadows.

Suggested shadows:

```text
shadow-xs
0 1px 2px rgba(16, 24, 40, 0.04)

shadow-sm
0 1px 3px rgba(16, 24, 40, 0.06),
0 1px 2px rgba(16, 24, 40, 0.04)

shadow-md
0 4px 12px rgba(16, 24, 40, 0.08)
```

Suggested usage:

```text
Card       none or xs
Dropdown   sm
Popover    sm
Dialog     md
```

Do not add decorative large shadows.

Expose these as Tailwind v4 theme tokens so `shadow-xs`, `shadow-sm`, and
`shadow-md` resolve to Luna values instead of framework defaults. Avoid adding
a shadow to every surface: normal cards should use a border plus no shadow or
`shadow-xs`; elevation is reserved for floating content.

---

# Implementation Scope

Primary file:

```text
packages/ui/src/styles/globals.css
```

Before editing:

1. Inspect the existing Luna Color System v1.
2. Preserve all working color variables.
3. Preserve Tailwind v4 directives.
4. Preserve shadcn/Base UI compatibility.
5. Extend the foundation rather than replacing it.

Implementation safeguards:

6. Keep `@source` coverage for Luna component files so consumer builds emit
   every utility used by the package.
7. Keep base styles inside the appropriate Tailwind layer; do not add an
   unlayered universal `padding` or `margin` reset that overrides component
   utilities.
8. Preserve all color/status/chart token values exactly unless fixing a proven
   defect outside this task is required for compilation.
9. Do not duplicate the entire default Tailwind spacing scale as Luna tokens.

---

# Component Alignment

Review these existing components:

```text
packages/ui/src/components/ui/button.tsx
packages/ui/src/components/ui/card.tsx
packages/ui/src/components/ui/checkbox.tsx
packages/ui/src/components/ui/dialog.tsx
packages/ui/src/components/ui/select.tsx
```

Make only minimal changes needed to align them with Luna Foundations v1.

Examples of acceptable adjustments:

- default button height to 36px
- button radius to the Luna default radius
- card radius/padding consistency
- control text size consistency
- dialog radius consistency
- replacing framework-default shadow utilities with Luna shadow tokens
- aligning all existing size variants to the explicit control-height matrix

Do not redesign component APIs.

Do not add new components.

Do not refactor unrelated logic.

Every adjusted component must preserve these states where applicable:

```text
default
hover
active / pressed
focus-visible
disabled
invalid
open / expanded
```

Do not remove Base UI data/ARIA selectors to simplify styling.

---

# Preferred Component Defaults

## Button

Target default:

```text
height       36px
radius       8px
font-size    14px
font-weight  500
horizontal padding 14–16px
```

Extra-small size:

```text
height       28px
font-size    12px
```

Compact size:

```text
height       32px
font-size    13px
```

Large size:

```text
height       40px
font-size    14px
```

Keep existing variants.

Existing button size keys must remain `xs`, `sm`, `default`, `lg`, `icon`,
`icon-xs`, `icon-sm`, and `icon-lg`.

---

## Card

Target:

```text
background   existing Luna card token
border       existing Luna border token
radius       10px
shadow       none or xs
padding      16–20px
```

Do not make Card overly spacious.

Prefer an explicit semantic border and `shadow-xs` (or no shadow) rather than
using a generic foreground ring as the default card outline.

---

## Checkbox

Target:

```text
radius       ~6px
size         compact and consistent
```

Preserve accessible focus states.

Keep the checkbox's interactive size and indicator legible; do not shrink it
below the current 16px visual control solely to match dense layouts.

---

## Dialog

Target:

```text
radius       12px
shadow       md
```

Preserve focus management and Base UI behavior.

The dialog overlay may remain a neutral translucent scrim. Do not convert it
to a brand-colored overlay. The popup should use Luna `shadow-md` and retain a
visible boundary against the background.

---

## Select

Target default control:

```text
height       36px
radius       8px
font-size    14px
```

Preserve interaction states and accessibility.

Map the existing Select size API as follows:

```text
sm       32px
default  36px
```

Do not invent unsupported Select size props in this task.

---

# Visual Test Page

Use `apps/web` only as a consumer test surface.

Do not move Luna token definitions into the app.

Preserve or update the existing lightweight Luna showcase so it shows:

- page title
- body text
- caption
- card title
- buttons in multiple sizes
- card
- select
- checkbox
- dialog trigger if already easy to render
- a small KPI number using tabular numerals

This page is for validation only.

It should look deliberate and professional enough to review the foundations,
but it must remain a single consumer-validation page rather than documentation
infrastructure. Reuse existing Luna components; do not simulate component
styling with app-local copies.

Do not turn `apps/web` into a routing/content platform or add documentation
dependencies yet.

Storybook is a later phase.

---

# Accessibility

Preserve:

- visible focus states
- readable control labels
- sufficient line-height
- keyboard accessibility
- existing Base UI interaction behavior

Do not shrink text below 12px.

Do not use low-contrast text for essential information.

Additional requirements:

- Preserve semantic HTML for headings, labels, and controls.
- Verify keyboard focus is visible on Button, Checkbox, Select, and Dialog.
- Icon-only controls must have an accessible name.
- A 28px visual control is allowed only in explicitly dense desktop contexts;
  do not present it as the default touch target.
- Disabled state must remain distinguishable without relying only on color.

---

# Do Not Do

Do NOT:

- replace Luna Color System v1
- install Storybook
- create documentation infrastructure
- add new UI libraries
- switch Base UI to Radix
- change shadcn preset
- rename packages
- change pnpm configuration
- change Turborepo setup
- publish Luna
- add animation systems
- create dark mode in this task
- add many new components
- introduce a huge design-token framework
- change Git remotes
- make unrelated refactors

Keep the scope to:

```text
Typography
Radius
Density
Shadow
```

---

# Validation

Run:

```bash
pnpm run check-types
pnpm run lint
pnpm run build
```

Also verify the Luna package directly:

```bash
cd packages/ui
pnpm run check-types
```

Run the consumer app if needed:

```bash
cd apps/web
pnpm run dev
```

Visually verify:

- Inter stack is applied or safely falls back if Inter is not loaded yet
- hierarchy between page title / section / body / caption is clear
- body text feels compact and readable
- controls are consistently 36px by default
- controls do not look oversized
- cards have subtle rounding
- dialogs remain visually elevated
- buttons remain accessible
- existing color tokens still work
- no component visually breaks

Interaction/state verification:

- Button: every variant and size, including focus-visible and disabled
- Checkbox: unchecked, checked, focus-visible, disabled, and invalid
- Select: default, open, selected item, focus-visible, disabled, and invalid
- Dialog: trigger, overlay, popup elevation, close control, and keyboard close
- Card: default boundary, padding, title/body rhythm, and nested content

Compiled CSS verification:

- no unprocessed `@source`, `@apply`, or `@tailwind utilities` directives
- Luna package component utilities are present in the consumer build
- typography, radius, control-height, and shadow utilities resolve to the
  intended Luna values
- existing color tokens remain present and unchanged

---

# Expected Result

Luna should now have a recognizable foundation:

```text
Luna Foundations v1
│
├── Color System v1       ✅ existing
├── Typography            ✅ new
├── Radius                ✅ new
├── Density / Spacing     ✅ new
└── Shadow                ✅ new
```

This foundation should be ready for the next stage:

```text
Storybook
↓
Component documentation
↓
Enterprise components
↓
DataTable / Filter / KPI / Status / Approval patterns
```

---

# Final Agent Report

When finished, report:

1. Files changed
2. Typography tokens added
3. Radius tokens added
4. Density / spacing decisions implemented
5. Shadow tokens added
6. Existing components adjusted and why
7. Whether `pnpm run check-types` passes
8. Whether `pnpm run lint` passes
9. Whether `pnpm run build` passes
10. Any warning or remaining issue
11. Screenshot/description of the visual-test result if available
12. Interaction states manually verified, and any state not verified

Do not claim a validation command passes unless it was actually run successfully.
