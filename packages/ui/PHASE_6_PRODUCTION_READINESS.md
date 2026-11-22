# Phase 6 — Production Readiness

Status: Phase 6A and Phase 6B implementation complete; Phase 6C not started.

## Purpose

Phase 6 turns Luna from a source-only workspace package into a reproducible,
testable distribution that can be consumed outside this monorepo. It also
defines the theme, compatibility, accessibility, and release contracts needed
before any public package decision.

Phase 6 is a production-readiness milestone. It does not authorize npm
publication, add application-specific business behavior, or reopen completed
Phase 1–5 component scope.

## Current baseline

At the start of Phase 6:

- `@withalif/luna` is private at version `0.5.0`.
- Package exports point directly to TypeScript and CSS files under `src/`.
- The package has no build script or declared distribution output.
- React and React DOM are package dependencies instead of peer dependencies.
- Workspace applications resolve Luna through `workspace:*`.
- Storybook provides the primary component, accessibility, and integration
  recipes.
- Internal releases use Git tags and a manually maintained changelog.

These facts are the migration baseline, not the desired final contract.

## Target outcome

By the end of Phase 6, Luna must have:

- A compiled ESM package with declarations, styles, source maps, and an explicit
  export map.
- A package archive that works without monorepo path aliases or source access.
- Documented theme, dark-mode, right-to-left, and application-ownership
  contracts.
- An evidence-based runtime, framework, browser, and accessibility support
  matrix.
- Automated release validation with a deliberate private or public release
  gate.

## Non-goals

Phase 6 does not add:

- Router bindings, data fetching, caching, optimistic updates, or persistence.
- Authentication, authorization, permission enforcement, or workflow
  execution.
- A form engine, application state manager, or production application starter.
- Business-specific components that are not required to validate distribution,
  themes, compatibility, or accessibility.
- npm publication without an explicit owner decision, approved license, and
  successful Phase 6D gate.

## Execution rules for agents

Agents working on Phase 6 must follow this order:

1. Read this document, `packages/ui/README.md`, `README.md`, and the Phase 5E
   ownership boundaries before changing the package contract.
2. Work on only one subphase at a time: 6A, then 6B, then 6C, then 6D.
3. Start each subphase with an audit of existing capabilities and write down
   reuse, replacement, and deferral decisions.
4. Prefer the smallest build or runtime dependency that satisfies an approved
   contract. Do not install competing tools for comparison in the committed
   tree.
5. Preserve the public imports `@withalif/luna` and
   `@withalif/luna/styles.css` unless a documented breaking change is approved.
6. Add automated coverage and consumer-facing documentation in the same
   subphase as the behavior they validate.
7. Run the complete subphase gate before requesting review. Do not begin the
   next subphase while the current one is unmerged or has unresolved acceptance
   criteria.
8. Record deferrals explicitly. Do not silently expand scope to solve a later
   subphase.

Recommended branch names:

- `phase/6a-package-distribution`
- `phase/6b-theme-and-rtl`
- `phase/6c-compatibility-accessibility`
- `phase/6d-release-automation`

## Phase map

| Subphase | Primary outcome                                           | Status      | Depends on          |
| -------- | --------------------------------------------------------- | ----------- | ------------------- |
| 6A       | Compiled and installable package distribution             | Implemented | `v0.5.0` baseline   |
| 6B       | Stable theme, dark-mode, and RTL contracts                | Implemented | 6A package contract |
| 6C       | Verified compatibility and accessibility matrix           | Not started | 6A and 6B           |
| 6D       | Repeatable release pipeline and publication decision gate | Not started | 6A–6C               |

---

## Phase 6A — Package distribution foundation

Implementation decisions and validation commands are recorded in
[Phase 6A — Package Distribution](PHASE_6A_PACKAGE_DISTRIBUTION.md).

### Scope

Phase 6A creates a package artifact that consumers can install and build
without reading Luna's source tree or relying on workspace resolution.

### Required audit and decisions

Before implementation, document:

- The selected ESM build and declaration-generation approach.
- Whether CSS is copied, processed, or emitted as a separate build artifact.
- The public export map and which internal modules remain private.
- Which dependencies are runtime dependencies, peer dependencies, and
  development-only dependencies.
- How React client boundaries and server-safe imports are preserved.
- Whether source maps and declaration maps ship in the archive.

The decision must compare maintenance cost, output correctness, tree shaking,
CSS handling, and compatibility with the repository's TypeScript configuration.
Tool popularity alone is not an acceptance criterion.

### Deliverables

- Add a package `build` script and declare its `dist/` output in Turborepo.
- Emit ESM JavaScript and TypeScript declarations for every public export.
- Emit the public stylesheet and any required static package assets.
- Point package exports to `dist/`, including separate import and type targets.
- Add a package-content allowlist and preserve CSS through the package
  `sideEffects` contract.
- Move React and React DOM to peer dependencies while retaining development
  versions for local builds and tests.
- Define the supported peer range from tested evidence; do not guess support.
- Add `clean`, package validation, and archive inspection commands without
  deleting paths outside `packages/ui/dist` or explicitly created temporary
  fixtures.
- Update workspace applications so they validate the built package contract
  instead of bypassing it through direct source exports.

### Package smoke test

The smoke test must:

1. Build Luna from a clean checkout.
2. Create a package archive with the repository package manager.
3. Install that archive into a temporary consumer outside the workspace graph.
4. Import JavaScript, types, and `@withalif/luna/styles.css` only through public
   package entry points.
5. Build at least one client-rendered and one server-rendered consumer path.
6. Fail on missing files, unresolved workspace dependencies, duplicate React,
   private source imports, or declaration errors.

### Acceptance criteria

- `package.json` exports no file under `src/`.
- A clean package build produces only declared files under `dist/`.
- `pnpm pack` contains the README, package metadata, declarations, compiled
  modules, styles, and required assets—and excludes stories, tests, phase notes,
  and repository-only configuration.
- The packed archive passes the isolated consumer smoke test.
- Consumer builds do not bundle a second React instance.
- Existing Storybook stories and Phase 1–5 public API tests continue to pass.
- No component API changes are introduced solely to accommodate the build tool.

### Deferred to later subphases

- New themes and RTL hardening belong to 6B.
- Support-matrix claims and cross-browser expansion belong to 6C.
- Automated versioning, tagging, or publication belongs to 6D.

---

## Phase 6B — Theme, dark-mode, and RTL contract

The audit, selected contracts, findings, and implementation order are recorded
in [Phase 6B — Theme, Dark Mode, and RTL](PHASE_6B_THEME_RTL.md).

### Scope

Phase 6B defines how applications customize Luna's visual tokens while Luna
preserves accessible defaults and component behavior. Applications continue to
own theme selection, persistence, system-preference handling, and any theme
switcher UI.

### Required audit and decisions

Audit all public styles for:

- Primitive, semantic, component, chart, focus, and state tokens.
- Hard-coded colors, physical-direction properties, and theme-specific values.
- Contrast dependencies across default, hover, active, disabled, selected,
  warning, danger, success, and info states.
- Portals, overlays, charts, and native controls that may not inherit theme or
  direction automatically.

Document the selected theme selector contract, token override rules, fallback
behavior, and whether theme names are public API.

### Deliverables

- Preserve the current light theme as the backward-compatible default.
- Add a dark theme through semantic token overrides rather than component-level
  color duplication.
- Define the supported consumer token override surface and keep primitive
  implementation tokens private where practical.
- Replace physical left/right styling with logical properties where direction
  affects layout.
- Ensure icons, charts, tooltips, overlays, focus rings, and status treatments
  remain legible in every supported theme and direction.
- Add Storybook controls or decorators for light, dark, left-to-right, and
  right-to-left review.
- Document how an application activates a theme and direction without adding a
  Luna-owned persistence layer or theme switcher.

### Acceptance criteria

- Existing consumers receive the same light presentation without configuration.
- Light and dark themes meet the approved contrast thresholds for text,
  controls, focus indicators, chart data, and status states.
- Status and chart meaning never relies on color alone.
- Components render without page-level horizontal overflow at 320 px in both
  left-to-right and right-to-left directions.
- Popovers, dialogs, sheets, menus, tables, pagination, and chart labels retain
  correct reading order and interaction behavior in RTL.
- Theme switching does not require remounting the component tree.
- Automated token and contrast tests supplement manual rendered review.

### Deferred to later subphases

- Framework and browser support claims belong to 6C.
- Public theme packages, brand theme generators, and runtime theme managers are
  separate proposals beyond Phase 6B.

---

## Phase 6C — Compatibility and accessibility matrix

### Scope

Phase 6C replaces implicit compatibility assumptions with a tested support
matrix. A version or platform is supported only when CI or a documented manual
procedure validates it.

### Required audit and decisions

Define candidate support for:

- Node.js and package-manager versions.
- React and React DOM peer ranges.
- TypeScript versions used to consume emitted declarations.
- At least one server-rendered and one client-rendered application framework.
- Chromium, Firefox, and WebKit browser engines where interaction coverage is
  meaningful.
- Keyboard, screen reader, zoom, forced-colors, reduced-motion, theme, and RTL
  review.

Document exclusions and end-of-support rules. Do not advertise compatibility
based only on dependency peer ranges.

### Deliverables

- Add isolated consumer fixtures or generated test projects for each supported
  framework contract.
- Validate package installation, type checking, production builds, SSR-safe
  imports, client hydration, and stylesheet loading.
- Expand browser interaction coverage according to the approved matrix.
- Add declaration compatibility tests that import only public package paths.
- Add bundle and archive size reports with reviewed budgets and an explicit
  update procedure.
- Document the supported matrix and the distinction between automated and
  manual coverage.
- Retain manual keyboard and rendered responsive review for behavior that
  automation cannot establish reliably.

### Acceptance criteria

- Every supported matrix entry has repeatable evidence.
- Unsupported versions fail with documented package-manager, peer-dependency,
  or engine guidance where possible.
- Package imports do not access `window` or `document` during server rendering.
- Hydration completes without Luna-owned mismatch warnings.
- Public declarations resolve under every supported TypeScript configuration.
- Automated accessibility checks introduce zero serious or critical violations
  in the reference stories.
- Keyboard order, focus restoration, live announcements, 200% zoom, narrow
  layouts, themes, and RTL pass the documented manual review checklist.
- Size-budget changes require an explained baseline update in review.

### Deferred to later subphases

- Automated release creation and publication belong to 6D.
- Support for additional frameworks or legacy browsers requires separate
  evidence and does not block the initial matrix.

---

## Phase 6D — Release automation and publication gate

### Scope

Phase 6D makes Luna releases repeatable from a clean protected branch. It keeps
private distribution as the default until the repository owner explicitly
approves public publication.

### Required audit and decisions

Document:

- The versioning and changelog workflow.
- The source of the release version and rules for keeping tags and package
  metadata synchronized.
- Required branch protection, review, CI, and deployment environments.
- Artifact retention, provenance, rollback, and deprecation procedures.
- Whether the target remains an internal archive or becomes a public npm
  package.
- The approved license and security-reporting path required before a public
  release.

No agent may remove `private: true`, publish a package, create credentials, or
change repository protection settings without explicit authorization.

### Deliverables

- Add a CI release gate that runs formatting checks, lint, types, tests,
  production application builds, Storybook build, package build, archive
  inspection, isolated smoke tests, and size checks.
- Ensure CI uses the repository's declared Node.js and package-manager versions.
- Automate version and changelog consistency checks.
- Generate a reviewable package archive before any publish job can run.
- Keep publication in a separate protected job or workflow with the minimum
  required permissions.
- Prefer short-lived trusted publishing or provenance mechanisms over stored
  long-lived registry tokens when public publication is approved.
- Continue publishing Storybook independently from package publication.
- Update `RELEASING.md` with exact private and, if approved, public procedures.

### Acceptance criteria

- A clean clone can reproduce the release archive using documented commands.
- Pull requests cannot publish packages or create release tags.
- The release gate fails on version/tag mismatch, uncommitted generated output,
  missing changelog entries, smoke-test failure, or unexpected archive content.
- Publication requires the protected default branch, successful 6A–6C gates,
  and explicit environment approval.
- No release depends on credentials stored on a developer machine.
- Rollback, deprecation, and emergency patch procedures are documented and
  tested without deleting existing release tags.
- Storybook deployment and package release status are visible independently.

## Cross-phase validation commands

Each subphase may add commands, but it must preserve these baseline gates:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm build-storybook
```

By the end of 6A, the release gate must also include package build, archive
inspection, and isolated consumer smoke tests. Later subphases extend the gate;
they must not replace or weaken earlier checks.

## Phase 6 definition of done

Phase 6 is complete only when:

- All 6A–6D acceptance criteria are met or explicitly deferred in a reviewed
  decision record.
- The public API and ownership boundaries remain documented and tested.
- Package artifacts are reproducible from a clean clone.
- Supported environments have evidence-backed compatibility results.
- Theme, dark-mode, RTL, accessibility, and size review are part of the release
  gate.
- Release and Storybook deployment procedures are documented and repeatable.
- The repository owner has made and recorded the private-versus-public package
  decision.

Completing Phase 6 does not itself authorize npm publication. Publication is a
separate consequential action that requires explicit approval.

## Agent handoff format

At the end of each subphase, the implementing agent must report:

- Scope completed and files changed.
- Public package contract changes, including any approved breaking changes.
- Commands run and their results.
- Automated and manual coverage completed.
- Dependency and archive-size changes.
- Known limitations and explicit deferrals.
- The exact acceptance criteria that remain open.

An agent must not describe a subphase as complete while required work or an
acceptance criterion remains open.

## Deferred beyond Phase 6

After production readiness, separate milestones may consider remote-data
patterns, optimistic workflows, permission administration, production
application templates, additional framework adapters, or public theme tooling.
Those milestones must preserve the package, ownership, compatibility, and
release contracts established here.
