# @withalif/luna

`@withalif/luna` is the private UI package for the Luna design system. It
provides React components, icons, styles, chart primitives, and enterprise
workflow presentation patterns.

## Usage

```tsx
import "@withalif/luna/styles.css";
import { Button, DataTable, DetailField, DetailList } from "@withalif/luna";
```

Use `@withalif/luna` and `@withalif/luna/styles.css` for runtime imports. Files
below `src/` are implementation details and are not supported package entry
points.

Applications that compile Tailwind utilities against Luna's public token
names can reference the authoring-only theme contract:

```css
@import "@withalif/luna/styles.css";
@reference "@withalif/luna/theme.css";
```

`styles.css` is the runtime stylesheet. `theme.css` only exposes Tailwind
namespace mappings such as `bg-surface` and must not replace the runtime import
or be loaded as a second browser stylesheet.

## Theme and direction

Luna supports the public themes `light` and `dark`. Light remains the default
when `data-theme` is missing or unknown. Set the chosen theme on the document
root so components rendered through portals inherit it:

```html
<html data-theme="dark" dir="rtl"></html>
```

Direction has two coordinated parts. Keep the document `dir` attribute and
Luna's React direction context on the same `ltr` or `rtl` value:

```tsx
import { DirectionProvider, type Direction } from "@withalif/luna";
import { createRoot } from "react-dom/client";

const direction: Direction = "rtl";

document.documentElement.dir = direction;
document.documentElement.dataset.theme = "dark";

createRoot(document.getElementById("root")!).render(
  <DirectionProvider direction={direction}>
    <App />
  </DirectionProvider>,
);
```

The document attributes control native layout, logical CSS, browser controls,
and portal inheritance. `DirectionProvider` supplies the matching JavaScript
direction to Base UI interactions such as keyboard navigation and popup
alignment. Omitting both keeps the backward-compatible light/LTR behavior.

Applications own theme and locale selection, persistence, system-preference
handling, document updates, and switcher UI. Changing
`document.documentElement.dataset.theme` updates mounted Luna components
through semantic CSS variables; Luna does not require a React remount.

### Semantic token overrides

Load consumer overrides after `@withalif/luna/styles.css`, define each changed
semantic pair for both supported themes, and retain Luna's contrast
requirements. For example:

```css
:root,
[data-theme="light"] {
  --primary: #0058d9;
  --primary-foreground: #ffffff;
}

[data-theme="dark"] {
  --primary: #8bbeff;
  --primary-foreground: #111318;
}
```

The supported override surface covers page and component surfaces, text,
primary and neutral interactions, destructive and status treatments, borders,
focus, inputs, and chart colors. Primitive `--luna-*` ramps, Tailwind
`--color-*` mappings, and component-local variables are implementation details
and are not stable override points. Locally scoped themes are not supported
because portaled content inherits from the document root.

## Ownership boundary

Luna components own semantic presentation, generic controlled interactions,
responsive composition, visible focus treatment, and accessible field
relationships.

Consuming applications own routing, data access, formatting, localization,
validation rules, persistence, permissions, and workflow execution.

Luna is consumed through compiled files in `dist/`; consumers never compile the
package source. The package remains private and is installed through
`workspace:*` inside this monorepo until the Phase 6D publication decision.

## Verified compatibility baseline

The Phase 6C support baseline is intentionally exact. The packed package has
repeatable evidence for:

- Node.js `24.22.3` and `26.5.0` with pnpm `12.4.2`;
- React and React DOM `19.2.8`;
- TypeScript `7.0.2` with strict `Bundler` and `NodeNext` declaration checks;
- Vite `8.3.0` client builds and browser mounting;
- Next.js `16.3.4` production build, server render, and hydration; and
- Playwright `1.63.0` using Chromium `153.0.8010.12`, Firefox `155.0`, and
  WebKit `26.6`.

Other versions, frameworks, package managers, and browser engines are not part
of the current compatibility claim. The package metadata remains exact for
React peers until additional versions receive the same packed-archive fixture
evidence.

## Development

Run package checks from the repository root:

```sh
pnpm --filter @withalif/luna lint
pnpm --filter @withalif/luna check-types
pnpm --filter @withalif/luna run build
pnpm --filter @withalif/luna run pack:check
pnpm --filter @withalif/luna run size:report
pnpm --filter @withalif/luna run size:check
pnpm --filter @withalif/luna run test:package
pnpm --filter docs run test:phase6c:fixture
pnpm --filter docs run test:phase6c:browser
pnpm --filter docs run test:phase6c:preferences
pnpm --filter docs run test:phase6c:narrow
```

Use Storybook for component behavior, accessibility, and responsive examples:

```sh
pnpm storybook
```

The package exports compiled ESM, declarations, declaration maps, JavaScript
source maps, and a compiled stylesheet. Read
[Phase 6A — Package Distribution](PHASE_6A_PACKAGE_DISTRIBUTION.md) for the
artifact contract, dependency boundaries, and isolated consumer gate.
Read
[Phase 6C — Compatibility and Accessibility](PHASE_6C_COMPATIBILITY_ACCESSIBILITY.md)
for the exact support matrix, fixture budgets, automated evidence, and manual
review gate.

## Roadmap

Read [Phase 6 — Production Readiness](PHASE_6_PRODUCTION_READINESS.md) before
changing package exports, dependencies, themes, compatibility claims, or the
release pipeline. It defines the required 6A–6D order and acceptance gates for
agents working on the next milestone.
