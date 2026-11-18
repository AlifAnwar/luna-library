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

## Ownership boundary

Luna components own semantic presentation, generic controlled interactions,
responsive composition, visible focus treatment, and accessible field
relationships.

Consuming applications own routing, data access, formatting, localization,
validation rules, persistence, permissions, and workflow execution.

Luna is consumed through compiled files in `dist/`; consumers never compile the
package source. The package remains private and is installed through
`workspace:*` inside this monorepo until the Phase 6D publication decision.

## Development

Run package checks from the repository root:

```sh
pnpm --filter @withalif/luna lint
pnpm --filter @withalif/luna check-types
pnpm --filter @withalif/luna run build
pnpm --filter @withalif/luna run pack:check
pnpm --filter @withalif/luna run test:package
```

Use Storybook for component behavior, accessibility, and responsive examples:

```sh
pnpm storybook
```

The package exports compiled ESM, declarations, declaration maps, JavaScript
source maps, and a compiled stylesheet. Read
[Phase 6A — Package Distribution](PHASE_6A_PACKAGE_DISTRIBUTION.md) for the
artifact contract, dependency boundaries, and isolated consumer gate.

## Roadmap

Read [Phase 6 — Production Readiness](PHASE_6_PRODUCTION_READINESS.md) before
changing package exports, dependencies, themes, compatibility claims, or the
release pipeline. It defines the required 6A–6D order and acceptance gates for
agents working on the next milestone.
