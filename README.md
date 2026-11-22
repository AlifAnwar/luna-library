# Luna UI

Luna UI is an internal React design system for accessible, information-rich
enterprise applications. It combines reusable components, data visualization,
workflow patterns, and Storybook recipes in one TypeScript monorepo.

The current milestone is **v0.5.0**. The package remains private and is consumed
through this workspace; it is not published to npm.

## What is included

- Accessible controls and navigation primitives built on React and Base UI.
- Data tables with search, filters, sorting, pagination, selection, bulk
  actions, and export controls.
- Metric, cartesian, distribution, comparison, and gauge chart primitives.
- Dashboard, application shell, detail, form, activity, and approval patterns.
- Cross-pattern Storybook recipes covering loading, empty, error, validation,
  long-content, and narrow-screen states.
- Automated unit, interaction, accessibility, and public API coverage.

## Requirements

- Node.js 24 or newer
- pnpm 12.4.2 through Corepack

## Get started

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm storybook
```

Storybook runs at `http://localhost:6006`.

To run the two Next.js applications instead:

```sh
pnpm dev
```

- `web` runs at `http://localhost:3000`.
- `docs` runs at `http://localhost:3001`.

## Use Luna in this workspace

Add the workspace dependency to an application package:

```json
{
  "dependencies": {
    "@withalif/luna": "workspace:*"
  }
}
```

Import the global styles once near the application root, then import components
from the public package entry point:

```tsx
import "@withalif/luna/styles.css";
import { Button, Card, CardContent } from "@withalif/luna";
```

Light/LTR remains the no-configuration default. Applications can select the
public `light` or `dark` theme on `document.documentElement.dataset.theme` and
must pair the document `dir` attribute with Luna's public `DirectionProvider`
for direction-aware keyboard and popup behavior. See the
[UI package guide](packages/ui/README.md#theme-and-direction) for the complete
theme, portal, RTL, and semantic-token override contract.

The private package exports compiled ESM, TypeScript declarations, and a
compiled stylesheet from `dist/`. See the
[UI package guide](packages/ui/README.md) for ownership boundaries and usage
notes, and the
[Phase 6A distribution decision](packages/ui/PHASE_6A_PACKAGE_DISTRIBUTION.md)
for the artifact contract and isolated consumer gate.

## Commands

| Command                     | Purpose                                                |
| --------------------------- | ------------------------------------------------------ |
| `pnpm storybook`            | Start the component and pattern documentation.         |
| `pnpm build-storybook`      | Create a static Storybook build.                       |
| `pnpm dev`                  | Start all development applications.                    |
| `pnpm lint`                 | Run ESLint across the monorepo.                        |
| `pnpm check-types`          | Run TypeScript checks across the monorepo.             |
| `pnpm test`                 | Run unit and Storybook browser tests.                  |
| `pnpm build`                | Build Luna and the Next.js applications.               |
| `pnpm release:metadata`     | Validate release version, changelog, and tag metadata. |
| `pnpm release:verify-clean` | Reject dirty release trees and tracked artifacts.      |
| `pnpm release:archive`      | Build and validate one private package archive.        |
| `pnpm release:check`        | Run the complete local release gate.                   |

## Repository structure

```text
apps/
  docs/       Storybook stories, browser tests, and the docs application
  web/        Luna foundation reference application
packages/
  ui/         @withalif/luna components, icons, styles, and phase decisions
  eslint-config/
  typescript-config/
```

## Product boundaries

Luna owns semantic presentation, controlled interaction contracts, responsive
component behavior, accessible field relationships, and generic visual states.
Applications continue to own routing, data fetching, business validation,
persistence, authorization, localization, and workflow execution.

The complete integration boundary is documented in
[Phase 5E](packages/ui/PHASE_5E_CROSS_PATTERN_INTEGRATION.md).

## Releases and documentation

- Read [CHANGELOG.md](CHANGELOG.md) for milestone changes.
- Follow [RELEASING.md](RELEASING.md) to validate and tag an internal release.
- Follow [SECURITY.md](SECURITY.md) for private vulnerability reporting and
  security patch handling.
- Follow the [Phase 6 production-readiness roadmap](packages/ui/PHASE_6_PRODUCTION_READINESS.md)
  for package distribution, themes, compatibility, and release automation.
- Review the [Phase 6C compatibility and accessibility matrix](packages/ui/PHASE_6C_COMPATIBILITY_ACCESSIBILITY.md)
  for the exact tested runtime, framework, browser, and accessibility baseline.
- Follow the [Phase 6D release automation plan](packages/ui/PHASE_6D_RELEASE_AUTOMATION.md)
  before changing versioning, release workflows, package artifacts, or
  publication policy.
- Storybook is built and deployed to GitHub Pages after changes reach `main`.
  The repository must use **GitHub Actions** as its Pages publishing source.
