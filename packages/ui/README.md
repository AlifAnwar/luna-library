# @withalif/luna

`@withalif/luna` is the private UI package for the Luna design system. It
provides React components, icons, styles, chart primitives, and enterprise
workflow presentation patterns.

## Workspace usage

```tsx
import "@withalif/luna/styles.css";
import { Button, DataTable, DetailField, DetailList } from "@withalif/luna";
```

Import only from `@withalif/luna` and `@withalif/luna/styles.css`. Files below
`src/` are implementation details and are not supported package entry points.

## Ownership boundary

Luna components own semantic presentation, generic controlled interactions,
responsive composition, visible focus treatment, and accessible field
relationships.

Consuming applications own routing, data access, formatting, localization,
validation rules, persistence, permissions, and workflow execution.

## Development

Run package checks from the repository root:

```sh
pnpm --filter @withalif/luna lint
pnpm --filter @withalif/luna check-types
```

Use Storybook for component behavior, accessibility, and responsive examples:

```sh
pnpm storybook
```

The package exports TypeScript source and remains private. A future npm release
requires a compiled distribution, peer dependency review, package-content
validation, a license decision, and a dedicated publishing pipeline.
