# Changelog

This file records notable changes to Luna UI. Luna currently uses internal Git
tags for milestone releases and is not published to npm.

## [Unreleased]

### Added

- Phase 6 production-readiness roadmap covering package distribution, themes,
  compatibility, accessibility, and release automation.
- Compiled ESM, declarations, declaration maps, source maps, and a processed
  stylesheet for the private `@withalif/luna` package.
- Package archive inspection and an isolated client/SSR consumer smoke test.
- Public light/dark semantic theme selectors, document-root theme guidance,
  and a Luna `DirectionProvider` facade for direction-aware interactions.
- Four pinned Storybook review stories covering light/dark and LTR/RTL
  combinations at a narrow application boundary.

### Changed

- Package exports now resolve only to built `dist/` artifacts, and React plus
  React DOM are exact tested peer dependencies.
- Workspace applications now validate the built package contract instead of
  transpiling Luna source directly.
- Components now use theme-independent semantic colors, accessible focus and
  control boundaries, logical layout utilities, and direction-aware Luna-owned
  navigation glyphs.

## [0.5.0] - 2026-11-17

### Added

- Application shell and navigation recipes built from Luna's public primitives.
- Analytics dashboard and operations workspace compositions.
- `DetailList` and `DetailField` for semantic record detail layouts.
- Record detail and controlled edit-form workflow recipes.
- `ActivityLog`, `ActivityLogItem`, `ApprovalTimeline`, and
  `ApprovalTimelineItem` for read-only workflow history.
- A cross-pattern application recipe connecting overview, detail, edit,
  activity, and approval experiences.
- Loading, empty, unavailable, validation, long-content, and 320 px integration
  states across the Phase 5 recipes.

### Changed

- Hardened sidebar navigation, chart presentation, responsive overflow, focus
  movement, heading hierarchy, and status communication across integrated
  application patterns.
- Expanded public API, semantic, color contrast, and Storybook interaction test
  coverage for Phase 5.

### Validation

- Lint and TypeScript checks pass across the monorepo.
- All 595 unit and Storybook browser tests pass.
- The `docs` and `web` applications produce successful production builds.

### Deferred

- Router bindings, remote data orchestration, optimistic updates,
  unsaved-change blocking, permission enforcement, workflow execution, and a
  production application template remain outside the v0.5.0 package contract.

[Unreleased]: https://github.com/AlifAnwar/luna-library/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/AlifAnwar/luna-library/compare/v0.4.0...v0.5.0
