# Phase 6B — Theme, Dark Mode, and RTL

Status: audit and implementation contract completed on 2026-11-18;
implementation in progress. The packaged Tailwind authoring contract is
implemented; theme values, component hardening, RTL behavior, and rendered
review remain open.

Gate: **blocked until the implementation and rendered review in this document
pass**.

## Implementation progress

| Step                                          | Status                    |
| --------------------------------------------- | ------------------------- |
| 1. Package `theme.css` authoring contract     | Implemented and validated |
| 2. Light/dark selectors and contrast tests    | Not started               |
| 3. Component color and focus hardening        | Not started               |
| 4. Direction provider and Storybook decorator | Not started               |
| 5. Logical layout and directional glyphs      | Not started               |
| 6. Four-way Storybook and interaction matrix  | Not started               |
| 7. Automated and manual gates                 | Not started               |
| 8. Final consumer documentation and status    | Not started               |

Step 1 validation passed the package build, strict `publint`, archive
allowlist and export checks, isolated client/SSR consumer, React-singleton and
private-import checks, focused unit tests, and the production Storybook build.

## Purpose

Phase 6B gives Luna one stable theme contract, an accessible dark appearance,
and correct left-to-right and right-to-left behavior without moving
application concerns into the package.

Applications continue to own locale selection, theme and direction state,
persistence, system-preference handling, and switcher UI. Luna owns the CSS
tokens, the direction context required by its primitives, logical component
layout, and accessible defaults.

This document records the required Phase 6B audit before implementation. It
must be read with:

- `PHASE_6_PRODUCTION_READINESS.md`;
- `PHASE_6A_PACKAGE_DISTRIBUTION.md`;
- `PHASE_5E_CROSS_PATTERN_INTEGRATION.md`;
- `packages/ui/README.md`; and
- the repository `README.md`.

## Audited baseline

The audit covered the public stylesheet, all component source under
`packages/ui/src/components`, the Storybook preview configuration and stories,
the existing contrast tests, the package export map, and the installed
direction behavior of `@base-ui/react` 1.8.0.

The current baseline is:

- `@withalif/luna/styles.css` ships one light token set declared on `:root`.
- No supported selector activates a dark token set.
- Three components contain Tailwind `dark:` utilities. In the compiled CSS
  those utilities use `prefers-color-scheme`, so they can disagree with an
  application-selected theme.
- Storybook has no theme or direction globals.
- Storybook's authoring stylesheet references Luna's repository source because
  there is no packaged Tailwind theme reference.
- Base UI defaults its JavaScript direction context to `ltr`. A DOM `dir="rtl"`
  attribute by itself does not change Base UI keyboard navigation or logical
  popup positioning.
- Portals mount outside a local component subtree, so a theme or `dir`
  attribute applied only to an application container is not a sufficient
  contract.
- The light palette and chart contrast tests exist, but the parser reads only
  the first declaration of each token and cannot validate two theme blocks.

## Contract decisions

### Theme selector and ownership

The supported selector is `data-theme` on the document root:

```html
<html data-theme="light" dir="ltr"></html>
```

The public theme names are exactly `light` and `dark`.

- `:root` remains the light theme so existing consumers need no configuration.
- `[data-theme="light"]` explicitly selects the same light values.
- `[data-theme="dark"]` overrides semantic tokens only.
- A missing or unknown `data-theme` value falls back to the `:root` light
  values.
- Both supported selectors set the matching CSS `color-scheme`, so native
  controls and browser chrome use the correct appearance.
- Luna does not add a `prefers-color-scheme` media query, React theme provider,
  persistence layer, inline boot script, or switcher. The application may
  derive its chosen public theme name from any of those sources.
- Switching `document.documentElement.dataset.theme` must update mounted Luna
  components through CSS variables and must not require a React remount.

Applications must put the selector on `document.documentElement`, not only on
an inner application node. This makes the theme available to content portaled
to `document.body`.

### Direction selector and provider

Applications must set the native document direction and Luna's React direction
context from the same value:

```tsx
document.documentElement.dir = direction;

<DirectionProvider direction={direction}>{children}</DirectionProvider>;
```

`DirectionProvider` will be a Luna-owned public facade with the stable values
`ltr` and `rtl`. It will delegate behavior to Base UI without exporting Base UI
types as Luna's contract.

Both parts are required:

- the document `dir` attribute controls CSS logical properties, text layout,
  native controls, and portaled DOM inheritance; and
- `DirectionProvider` controls Base UI keyboard behavior, popup alignment,
  combobox chip navigation, and other JavaScript direction decisions across
  React portals.

Omitting both remains backward-compatible `ltr` behavior. Luna does not infer a
locale, mutate the document, persist direction, or provide a locale provider.

### Public token override surface

Components continue to consume semantic tokens; they must not select light or
dark colors directly. The supported color override groups are:

| Group                   | Public tokens                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Page and surfaces       | `--background`, `--surface`, `--surface-subtle`, `--surface-muted`, `--card`, `--popover`                                                                                                                                      |
| Text on surfaces        | `--foreground`, `--foreground-secondary`, `--foreground-muted`, `--card-foreground`, `--popover-foreground`                                                                                                                    |
| Primary interaction     | `--primary`, `--primary-hover`, `--primary-active`, `--primary-subtle`, `--primary-foreground`                                                                                                                                 |
| Neutral interaction     | `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`                                                                                                                    |
| Destructive interaction | `--destructive`, `--destructive-foreground`                                                                                                                                                                                    |
| Boundaries and focus    | `--border`, `--border-subtle`, `--input`, `--ring`                                                                                                                                                                             |
| Status                  | `--success`, `--success-subtle`, `--success-border`, `--success-foreground`, `--warning`, `--warning-subtle`, `--warning-border`, `--danger`, `--danger-subtle`, `--danger-border`, `--info`, `--info-subtle`, `--info-border` |
| Charts                  | `--chart-1` through `--chart-5`, `--chart-outline`, and each matching `--chart-N-foreground`                                                                                                                                   |

The existing semantic typography, radius, density, card-padding, and elevation
tokens remain supported foundation overrides. They are not switched merely
because a theme changes, except that dark mode may override elevation values
whose light shadows are not visible on dark surfaces.

The following stay implementation details and are not stable consumer override
points:

- the `--luna-blue-*` and named sky primitive ramps;
- Tailwind namespace aliases such as `--color-*`, `--text-*`, and
  `--spacing-*`;
- local variables such as `--card-spacing`, `--chart-segment-*`, and Base UI or
  Recharts positioning variables; and
- raw values used to construct a semantic token.

A consumer override must be loaded after `@withalif/luna/styles.css`, override
the complete semantic pair it changes in both supported theme selectors, and
retain the contrast requirements below. Luna guarantees fallback values for
every supported token; incomplete consumer overrides inherit the remaining
Luna values.

### Tailwind authoring contract

Runtime CSS remains available through the backward-compatible import:

```css
@import "@withalif/luna/styles.css";
```

Phase 6B will add `@withalif/luna/theme.css` as an authoring-only Tailwind
reference containing Luna's public namespace mappings. It will let Storybook
and Tailwind-consuming applications compile utilities such as `bg-surface`
without importing a repository source path:

```css
@reference "@withalif/luna/theme.css";
```

`theme.css` is compiler metadata, not a second runtime theme or a theme
manager. Adding brand theme packages, generators, or runtime theme packages
remains deferred beyond Phase 6B.

### Physical side APIs

Explicit physical APIs remain physical for backward compatibility:

- `SheetContent side="left" | "right"` continues to describe the viewport
  edge and its matching animation.
- `Sidebar side="left" | "right"` continues to describe the viewport edge.
- Explicit popup sides `left` and `right` remain physical; consumers should use
  Base UI's logical `inline-start` or `inline-end` values when they want
  direction-aware placement.

Physical coordinate math used to center dialogs, position chart labels, draw
SVG arcs, or configure Recharts margins also remains physical. These are
geometry, not reading-direction layout.

All other leading/trailing spacing, alignment, indicators, close buttons,
range corners, disclosure glyphs, and toggle movement must follow the document
direction.

## Token and color audit

### Inventory and decisions

| Existing capability              | Audit result                                                                                                        | Decision                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| One `@theme inline` mapping      | It centralizes Tailwind utilities but is embedded in the runtime source file.                                       | Extract a reusable authoring reference and keep one mapping source.                                                 |
| Light semantic values on `:root` | Components already use semantic utility names in most places.                                                       | Reuse as the default, correcting only values or treatments required by the approved contrast gate.                  |
| Primitive blue and sky ramps     | Components reach them through semantic aliases.                                                                     | Keep private and do not duplicate the ramp in the dark selector.                                                    |
| Surface and text aliases         | Card and popover already resolve through surface semantics.                                                         | Reuse; override the semantic values in dark mode.                                                                   |
| Status tokens                    | Visible labels and differing icons/shapes already prevent color-only meaning.                                       | Reuse the token names; verify icon, border, subtle-surface, and solid-fill pairs in both themes.                    |
| Chart tokens                     | Charts already use five fills, a neutral outline, distinct markers/patterns, visible labels, and accessible tables. | Reuse; provide dark values and paired label foregrounds rather than component-specific chart colors.                |
| Focus and input tokens           | The names are semantic, but current light contrast is insufficient.                                                 | Reuse the names and correct token values and/or alpha treatments.                                                   |
| Elevation                        | Shadows contain centralized raw RGB values tuned for light surfaces.                                                | Keep semantic shadow names and provide dark-appropriate values if rendered review shows the light values disappear. |
| Component-local colors           | `Alert` and `Toast` icon discs use `bg-white`.                                                                      | Replace with a semantic surface token.                                                                              |
| Component dark variants          | `Button`, `Checkbox`, and `Select` contain `dark:` utilities compiled from system preference.                       | Remove them; semantic tokens must carry every theme difference.                                                     |

No hexadecimal, RGB, HSL, or OKLCH values were found in component source.
Raw color values are otherwise centralized in `globals.css`, apart from the two
`bg-white` utilities above. Semantic `color-mix()` expressions in buttons and
charts are retained but must be measured from their rendered result in both
themes.

### Measured light-theme pairs

The following values were computed from the declared six-digit hex tokens.
WCAG 2 AA is the conformance gate: `4.5:1` for normal text and `3:1` for
large text, active UI boundaries, focus indicators, and graphical objects.
APCA may be recorded as a design tiebreaker, but it does not replace the WCAG 2
gate.

| Pair                                 |           Measured |                 Required role | Audit result                                                      |
| ------------------------------------ | -----------------: | ----------------------------: | ----------------------------------------------------------------- |
| `foreground` / `background`          |          `17.47:1` |           Normal text `4.5:1` | Pass                                                              |
| `foreground` / `surface`             |          `18.58:1` |           Normal text `4.5:1` | Pass                                                              |
| `foreground-secondary` / `surface`   |           `4.97:1` |           Normal text `4.5:1` | Pass                                                              |
| `secondary-foreground` / `secondary` |           `9.57:1` |           Normal text `4.5:1` | Pass                                                              |
| `primary-foreground` / `primary`     |           `5.04:1` |           Normal text `4.5:1` | Pass                                                              |
| `primary-active` / `primary-subtle`  |           `7.48:1` |           Normal text `4.5:1` | Pass                                                              |
| `danger` / `danger-subtle`           |           `6.38:1` |           Normal text `4.5:1` | Pass                                                              |
| `info` / `info-subtle`               |           `4.63:1` |           Normal text `4.5:1` | Pass                                                              |
| `success` / `success-subtle`         |           `4.02:1` |             Icon/marker `3:1` | Pass for Luna's current non-text use; not approved as normal text |
| `warning` / `warning-subtle`         |           `3.76:1` |             Icon/marker `3:1` | Pass for Luna's current non-text use; not approved as normal text |
| `ring` / `surface`                   |           `1.93:1` |                Focus/UI `3:1` | Fail                                                              |
| `ring` at 50% / `surface`            |           `1.37:1` |                Focus/UI `3:1` | Fail                                                              |
| `input` / `surface`                  |           `1.22:1` | Active control boundary `3:1` | Fail                                                              |
| `chart-outline` / `surface`          |           `4.97:1` |        Graphical object `3:1` | Pass                                                              |
| `chart-N-foreground` / `chart-N`     | `5.08:1`–`17.03:1` |           Normal text `4.5:1` | Pass                                                              |

`foreground-muted` measures `2.58:1` on `surface`. Luna currently uses that
token only for de-emphasized decorative output, not required body copy. The
implementation must keep readable supporting copy on `muted-foreground`, which
resolves to `foreground-secondary`, and must not move normal text onto
`foreground-muted`.

Disabled controls are exempt from WCAG 2's minimum contrast rule, but Phase 6B
rendered review must still confirm that they remain identifiable and distinct
from enabled controls. No dark values exist yet, so every dark pair is **Not
verified**.

### Actionable color findings

| Severity | Location                                                                            | Before                                                                   | Required outcome                                                                                                | Why                                                                              |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Medium   | `packages/ui/src/styles/globals.css:109-113` and focus classes across controls      | Input boundary `1.22:1`; solid ring `1.93:1`; 50% ring `1.37:1` on white | Active control boundaries and every visible focus treatment reach `3:1` against adjacent colors in both themes. | Systemic control and keyboard-focus information is too faint.                    |
| Medium   | `packages/ui/src/components/ui/button.tsx:7-20`, `checkbox.tsx:10`, `select.tsx:45` | Theme differences are encoded with `dark:` and system preference.        | Remove component theme branches and resolve every state through semantic variables.                             | Application selection and system preference can currently produce a mixed theme. |
| Medium   | `packages/ui/src/components/ui/alert.tsx:23`, `toast.tsx:17`                        | Status icon discs use `bg-white`.                                        | Use a semantic surface token that remains intentional in both themes.                                           | A raw appearance-specific utility bypasses the theme contract.                   |
| Medium   | `packages/ui/src/styles/globals.css:55-147`                                         | Only light values exist.                                                 | Add complete dark semantic values and measured pairs.                                                           | Dark mode cannot be approved or verified.                                        |

## RTL audit

### Direction-dependent replacements

| Area                            | Current physical styling or behavior                              | Required implementation                                                                        |
| ------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Input file button               | `file:mr-3`                                                       | Use logical margin end.                                                                        |
| Select items                    | `text-left`, `pr-8 pl-2`, and indicator `right-2`                 | Use text start, logical padding, and inset end.                                                |
| Dropdown checked items          | `pl-8`, indicators `left-2`, submenu `ml-auto`, right chevron     | Use logical start spacing/inset/end margin and mirror the disclosure glyph.                    |
| Multi-select                    | `-mr-1`, `pr-8 pl-2`, indicator `right-2`                         | Use logical end margin, logical padding, and inset end.                                        |
| Password input                  | `pr-11` and reveal button `right-1`                               | Use logical padding end and inset end.                                                         |
| Dialog and sheet close controls | `right-2` / `right-3`; sheet header `pr-12`                       | Use inset end and padding end. Dialog centering stays physical geometry.                       |
| Stepper                         | `text-left` and vertical connector `ml-6`                         | Use text start and logical margin start.                                                       |
| Sidebar internals               | right-positioned actions, `ml-3.5`, `border-l`, and `text-left`   | Use logical insets, margin, border, and text alignment. Keep the explicit physical `side` API. |
| Date range                      | `rounded-l-md` / `rounded-r-md`                                   | Use logical start/end corners.                                                                 |
| Switch                          | Checked thumb always translates on positive X                     | Reverse the transform in RTL.                                                                  |
| Breadcrumb                      | Default separator is a right chevron                              | Mirror the Luna-owned separator in RTL.                                                        |
| Pagination                      | Previous/next and first/last icons are physically fixed           | Mirror Luna-owned navigation icons while preserving DOM order and labels.                      |
| Select inline-side animation    | `inline-start` and `inline-end` use LTR physical slide directions | Add direction-aware animation for logical sides; explicit physical sides remain physical.      |

Chart centering transforms, chart label coordinates, SVG arc coordinates,
Recharts left/right margins, and the explicit physical side mappings in
`Sheet` and `Sidebar` are documented exceptions. They must not be mechanically
converted to logical properties.

### Actionable RTL findings

| Severity | Location                                         | Before                                                           | Required outcome                                                                                | Why                                                                                              |
| -------- | ------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| High     | Public package and every Base UI-backed control  | No Luna direction provider; Base UI defaults to `ltr`.           | Export the Luna `DirectionProvider` facade and use it in Storybook's direction decorator.       | DOM mirroring alone leaves keyboard behavior and logical popup placement in the wrong direction. |
| Medium   | The component locations in the replacement table | Physical spacing, alignment, corners, and indicators assume LTR. | Replace direction-dependent layout with logical utilities and targeted RTL transforms.          | Visual reading order and control affordances do not mirror reliably.                             |
| Medium   | Breadcrumb and pagination components             | Navigation glyphs always point left/right according to LTR.      | Mirror Luna-owned directional glyphs under RTL without reordering the DOM.                      | Labels and visual direction can disagree.                                                        |
| Medium   | `Sidebar` tooltip calls                          | Tooltips are hard-coded to physical `right`.                     | Place tooltips on the content-facing edge derived from the sidebar side and direction contract. | A right sidebar can open tooltips off the viewport or over the rail.                             |

## Portal, overlay, chart, and native-control audit

| Surface                                                                      | Existing behavior                                                                                      | Phase 6B decision and review                                                                                                                                                            |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Select, dropdown menu, popover, tooltip, searchable select, and multi-select | Base UI portals content to the document.                                                               | Root theme/`dir` plus React direction context is the supported inheritance path. Verify logical popup sides, keyboard arrows, Escape, and trigger-focus restoration in both directions. |
| Dialog, sheet, drawer, and command dialog                                    | Dialog primitives portal backdrop and content.                                                         | Verify surface tokens, focus rings, close-button logical placement, scroll containment, focus trap, and focus restoration in all four theme/direction combinations.                     |
| Toast                                                                        | Viewport is portaled and already uses logical `end`.                                                   | Verify theme inheritance, RTL viewport placement, status legibility, swipe behavior, and persistent actionable/error toasts.                                                            |
| Cartesian and distribution chart tooltips                                    | Tooltips are portaled; chart marks and labels use semantic chart variables.                            | Verify tooltip inheritance and direction. Keep coordinate geometry physical and data/accessible-table order equal to consumer input order.                                              |
| Charts and gauges                                                            | Fills have neutral outlines; series also use labels, markers, dash/fill patterns, and accessible data. | Reuse non-color cues. Measure outlines, slice labels, grid/axis lines, tooltip text, and focus outline in both themes.                                                                  |
| Native inputs and browser UI                                                 | No Luna `color-scheme` declaration exists.                                                             | Set `color-scheme` in each public theme selector and review date, password, file, and autofill appearances.                                                                             |

Locally scoped themes are intentionally unsupported for portaled content in
Phase 6B. Supporting multiple simultaneous theme roots with portal containers
would require a separate API proposal.

## Storybook review contract

Storybook will expose two toolbar globals:

- `theme`: `light` or `dark`; and
- `direction`: `ltr` or `rtl`.

The preview decorator must:

1. set `data-theme` and `dir` on `document.documentElement`;
2. wrap the story in Luna's `DirectionProvider` using the same direction;
3. update those values without remounting the story tree; and
4. restore any prior document attributes during cleanup.

A representative reference story must pin and exercise all four matrices:

| Theme | Direction |
| ----- | --------- |
| Light | LTR       |
| Light | RTL       |
| Dark  | LTR       |
| Dark  | RTL       |

The matrix must include text and surfaces, every control state, statuses,
charts, a table, date/range controls, menus/popovers/tooltips, a dialog, a
sheet, toast output, pagination, breadcrumb, sidebar, and switch. Existing
component and cross-pattern stories should be reused rather than duplicating a
second component catalog.

At 320 px, each matrix must be reviewed for page-level horizontal overflow.
Dense tables may scroll only inside their labelled table region. RTL review
must also cover reading order, Tab order, arrow-key behavior, popup placement,
focus restoration, and text that mixes locale content with numbers.

## Automated coverage required

Phase 6B implementation must add or extend tests for:

- complete light and dark token blocks with no missing supported semantic
  token;
- the public `light` and `dark` selector names and light fallback;
- absence of raw component color utilities and component `dark:` variants;
- text, focus, active-control, status, and chart contrast pairs in both themes;
- packed `theme.css` contents and public export resolution without source
  access;
- preservation of the existing `styles.css` package entry point;
- `DirectionProvider` public types and behavior;
- logical classes and intentional physical-geometry exceptions;
- representative RTL keyboard behavior for Base UI menus, select/combobox,
  pagination, date controls, dialog/sheet, and switch; and
- Storybook globals and the four pinned matrix stories.

The existing contrast helper must be changed to parse a requested theme block
instead of returning the first token declaration in the stylesheet. Tests must
measure resolved colors and alpha composites; they must not compare token names
or assume that a dark palette is a reversed light palette.

## Manual verification checklist

The implementation is not complete until a rendered browser review records:

- light/LTR, light/RTL, dark/LTR, and dark/RTL;
- default, hover, active, selected, invalid, disabled, and loading states;
- a visible focus indicator at every keyboard stop;
- no page-level overflow at 320 px and no clipping at 200% zoom;
- menu, select, combobox, date, dialog, sheet, toast, and tooltip portals;
- correct native control appearance and autofill treatment;
- chart fills, outlines, labels, tooltips, keyboard focus, and non-color cues;
- no theme flash or component remount caused by an in-page theme change; and
- no stale theme or direction attributes after Storybook changes globals.

The current audit did not run this browser matrix. All rendered items above are
**Not verified** until implementation exists.

## Reuse, replacement, and deferral summary

| Decision          | Items                                                                                                                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reuse             | Current semantic token names, light appearance as the no-config default, chart outlines and non-color cues, public `styles.css`, Base UI portals/primitives, existing component and integration stories.                                                              |
| Replace or extend | Add the dark semantic block, correct light focus/control contrast, remove raw `bg-white` and `dark:` branches, add packaged `theme.css`, export the Luna direction facade, migrate direction-sensitive layout and glyphs, and add the four-way Storybook/test matrix. |
| Defer             | Theme persistence, system-preference logic, switcher UI, localization, multiple simultaneous scoped theme roots, brand packages, theme generators, runtime theme managers, new browser-support claims, and public package publication.                                |

## Implementation order

Agents must implement this subphase in the following order:

1. Extract the Tailwind authoring contract and add the packaged `theme.css`
   export without changing `styles.css`.
2. Add explicit light/dark selectors, semantic dark overrides,
   `color-scheme`, and theme-aware token/contrast tests.
3. Remove component raw colors and `dark:` utilities; correct focus and active
   control contrast.
4. Add the public `DirectionProvider` facade and Storybook document decorator.
5. Convert direction-dependent styles and Luna-owned directional glyphs while
   preserving the documented physical-geometry exceptions.
6. Add the four Storybook matrix entries and targeted interaction tests.
7. Run the package, workspace, Storybook, 320 px, keyboard, theme-switch, and
   RTL manual gates.
8. Update consumer documentation and this status only after every required
   result is recorded.

Do not begin Phase 6C while any Phase 6B acceptance criterion or manual check
remains open.
