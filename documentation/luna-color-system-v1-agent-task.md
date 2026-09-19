# Agent Task — Implement Luna Color System v1

You are working inside an existing healthy **pnpm + Turborepo** monorepo named `luna-library`.

## Current Project State

The workspace/package-manager migration and Luna UI foundation are already complete.

Current relevant structure:

```text
luna-library/
├── apps/
│   ├── docs/
│   └── web/
├── packages/
│   ├── eslint-config/
│   ├── typescript-config/
│   └── ui/
│       ├── components.json
│       ├── postcss.config.mjs
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── components/
│           │   └── ui/
│           │       ├── button.tsx
│           │       ├── card.tsx
│           │       ├── checkbox.tsx
│           │       ├── dialog.tsx
│           │       └── select.tsx
│           ├── lib/
│           │   └── utils.ts
│           ├── styles/
│           │   └── globals.css
│           └── index.ts
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── turbo.json
```

Important current facts:

- Luna package name: `@withalif/luna`
- `apps/web` consumes Luna through `workspace:*`
- Tailwind CSS v4 is already installed
- PostCSS is already configured
- shadcn is configured manually
- Component library: **Base UI**
- shadcn preset: **Nova**
- Existing Luna components already compile
- `apps/web` already successfully renders Luna components
- `@withalif/luna/styles.css` is already exported
- TypeScript uses `@/* -> ./src/*`
- The repo is healthy before this task

---

# Goal

Implement **Luna Color System v1** as the first Luna-specific visual identity layer.

Luna is an internal React design system for:

- enterprise dashboards
- management systems
- operational/back-office applications
- ERP / CRM / HRIS / WMS / inventory / finance / workforce tools

The visual direction should feel:

> modern enterprise SaaS — clean, calm, information-dense, professional, restrained, and highly reusable.

The color system is inspired by a light enterprise dashboard reference with:

- neutral / white surfaces
- strong royal blue as the main brand color
- subtle borders
- restrained semantic colors
- mostly monochromatic blue data visualization

This task is **not** to redesign components or create new components.

---

# Design Principles

1. Most of the interface should remain neutral.
2. Blue is the main Luna brand color.
3. Semantic colors must communicate meaning, not decoration.
4. Avoid hardcoded Tailwind colors such as:
   - `bg-blue-500`
   - `text-green-600`
   - `border-red-400`
5. Components should rely on semantic design tokens wherever possible.
6. Preserve compatibility with existing shadcn / Base UI components.
7. Preserve Tailwind CSS v4 conventions.
8. Keep light mode as the primary focus for v1.
9. Do not invent a large theming architecture beyond what is required.
10. Keep the implementation easy to extend with dark mode later.

---

# Luna Primitive Brand Palette

Use this palette as the Luna blue family:

```text
blue-50   #EEF6FF
blue-100  #D3E5FE
blue-200  #9BC4FC
blue-300  #63A2FA
blue-400  #2B83F7
blue-500  #0065F4
blue-600  #0058D6
blue-700  #0049B3
blue-800  #00398C
blue-900  #002B69
```

Primary Luna brand color:

```text
#0065F4
```

---

# Core Semantic Colors

Use these values as the target visual system.

## Brand

```text
primary              #0065F4
primary-hover        #0058D6
primary-active       #0049B3
primary-subtle       #EEF6FF
primary-foreground   #FFFFFF
```

## Background / Surfaces

```text
background           #F6F8FB
surface              #FFFFFF
surface-subtle       #FAFBFC
surface-muted        #F3F5F7
```

## Text

```text
foreground           #111318
foreground-secondary #667085
foreground-muted     #98A2B3
```

## Borders / Input

```text
border               #E6E9EF
border-subtle        #EEF0F3
input                #E6E9EF
ring                 #63A2FA
```

---

# Semantic Status Colors

## Success

```text
success        #168A6B
success-subtle #EAFBF5
success-border #B8EDDD
```

## Warning

```text
warning        #B76E00
warning-subtle #FFF7E6
warning-border #F7D99A
```

## Danger

```text
danger        #D94D55
danger-subtle #FFF0F1
danger-border #F4C2C6
```

## Info

```text
info        #0065F4
info-subtle #EEF6FF
info-border #9BC4FC
```

---

# Chart Colors

Luna should prefer a restrained monochromatic blue scale for default dashboards.

```text
chart-1 #0065F4
chart-2 #2B83F7
chart-3 #63A2FA
chart-4 #9BC4FC
chart-5 #D3E5FE
```

Do not introduce a rainbow chart palette as the default.

---

# shadcn Semantic Mapping

Map the Luna system to the existing shadcn semantic variables.

Target mapping:

```text
background            -> #F6F8FB
foreground            -> #111318

card                   -> #FFFFFF
card-foreground        -> #111318

popover                -> #FFFFFF
popover-foreground     -> #111318

primary                -> #0065F4
primary-foreground     -> #FFFFFF

secondary              -> #F3F5F7
secondary-foreground   -> #344054

muted                  -> #F3F5F7
muted-foreground       -> #667085

accent                 -> #EEF6FF
accent-foreground      -> #0049B3

destructive            -> #D94D55
destructive-foreground -> #FFFFFF

border                 -> #E6E9EF
input                  -> #E6E9EF
ring                   -> #63A2FA
```

Preserve any additional variables required by the currently generated Base UI / Nova components.

---

# Implementation Requirements

Primary file:

```text
packages/ui/src/styles/globals.css
```

Implement the Luna Color System there.

Before editing:

1. Inspect the current `globals.css`.
2. Preserve any required Tailwind v4 directives.
3. Preserve required shadcn / Base UI token mappings.
4. Do not blindly replace working framework configuration.

The existing project uses Tailwind CSS v4, so use the existing Tailwind v4 CSS-first structure.

If the existing file contains `@theme inline`, update or extend it so Tailwind utilities can resolve the Luna semantic CSS variables.

Expected semantic utilities should continue to work, including examples such as:

```text
bg-background
text-foreground
bg-primary
text-primary-foreground
bg-muted
text-muted-foreground
border-border
ring-ring
```

Also expose Luna-specific semantic tokens so they can be used later for components such as StatusBadge and alerts:

```text
success
success-subtle
success-border

warning
warning-subtle
warning-border

danger
danger-subtle
danger-border

info
info-subtle
info-border
```

Prefer semantic utility names such as:

```text
bg-success-subtle
text-success
border-success-border
```

if they can be cleanly supported through the current Tailwind v4 theme mapping.

Do not add unnecessary plugins or dependencies.

---

# Primitive vs Semantic Tokens

If practical within the existing CSS-first setup, keep a clean distinction:

```text
Primitive palette
    ↓
Semantic variables
    ↓
Tailwind utilities
    ↓
Luna components
```

Example concept:

```css
--luna-blue-500: #0065f4;
--primary: var(--luna-blue-500);
```

However, do not over-engineer this.

A small, readable token layer is preferred over a large token framework.

---

# Existing Component Compatibility

Check the generated components under:

```text
packages/ui/src/components/ui/
```

Especially:

```text
button.tsx
card.tsx
checkbox.tsx
dialog.tsx
select.tsx
```

Do not redesign them in this task.

Only make minimal changes if a component contains a hardcoded color that directly prevents it from using the new semantic system.

Do not change component APIs.

Do not rename components.

Do not replace Base UI.

Do not switch shadcn presets.

---

# Consumer App Validation

`apps/web` is the consumer test application.

Ensure that the Luna stylesheet remains consumable through:

```tsx
import "@withalif/luna/styles.css";
```

and components remain consumable through:

```tsx
import { Button } from "@withalif/luna";
```

Do not move Luna styles into `apps/web`.

Luna must own its design tokens.

---

# Do Not Do

Do NOT:

- recreate the Turborepo
- change pnpm workspace configuration
- change package manager
- rename `packages/ui`
- rename `@withalif/luna`
- install Storybook
- install another component framework
- replace Base UI with Radix
- reinstall shadcn
- change the Nova preset
- add dark mode implementation unless required to preserve existing behavior
- add typography tokens in this task
- add spacing tokens in this task
- add new Luna components
- publish the package
- change Git remotes
- make unrelated refactors
- rewrite `apps/web`
- delete existing generated components

Keep this PR focused on **Luna Color System v1**.

---

# Validation

After implementation, run from the repository root if appropriate:

```bash
pnpm run check-types
pnpm run lint
pnpm run build
```

Also verify the UI package directly:

```bash
cd packages/ui
pnpm run check-types
```

If needed, run the consumer app:

```bash
cd apps/web
pnpm run dev
```

Confirm visually that:

- the primary Luna button uses the royal blue brand color
- app/page surfaces remain light and neutral
- borders are subtle
- text has strong but not pure-black contrast
- hover / active states remain usable
- existing components still render correctly
- no component becomes visually broken because of missing CSS variables

---

# Expected Result

After this task, Luna should have its own reusable color identity:

```text
Base UI
   ↓
shadcn / Nova
   ↓
Luna Color System v1
   ↓
Luna Components
   ↓
Enterprise Dashboard Patterns
```

The result should no longer feel like untouched default shadcn styling.

It should start to feel like a cohesive enterprise design system.

---

# Final Agent Report

When finished, report:

1. Files changed
2. New/updated token groups
3. Any component files minimally adjusted and why
4. Whether `pnpm run check-types` passes
5. Whether `pnpm run lint` passes
6. Whether `pnpm run build` passes
7. Any warnings or remaining issues
8. A short explanation of how Luna-specific semantic colors can be used in future components

Do not claim a validation command passes unless it was actually run successfully.
