# Phase 6C — Compatibility and Accessibility Matrix

Status: automated compatibility and accessibility implementation completed on
2026-11-22; manual assistive-technology/zoom review and the explicitly deferred
full Phase 6A–6C validation gate remain open.

Gate: **open**. Phase 6D must not begin until every supported matrix entry has
repeatable evidence and the automated and manual accessibility gates pass.

## Purpose

Phase 6C turns Luna's implicit compatibility assumptions into an explicit,
evidence-backed support contract. A runtime, framework, browser engine, or
accessibility behavior is supported only after the corresponding automated or
documented manual procedure passes.

This phase validates the compiled `@withalif/luna` package produced by Phase 6A
and the theme/direction contract completed in Phase 6B. It does not add product
features or move application-owned behavior into Luna.

## Progress

| Step                                                      | Status                                                                                    |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1. Repository baseline and ownership audit                | Complete                                                                                  |
| 2. Runtime, package-manager, React, and TypeScript matrix | Exact tested baseline recorded                                                            |
| 3. Framework and hydration fixtures                       | Vite mount and Next.js SSR/hydration fixture passed from packed archive                   |
| 4. Cross-browser interaction matrix                       | Reference suite passed in Chromium, Firefox, and WebKit                                   |
| 5. Automated and manual accessibility matrix              | Automated, preferences, and 320 px suites passed; screen-reader and 200% zoom review open |
| 6. Bundle and archive size budgets                        | Package and representative fixture budgets active                                         |
| 7. Consumer documentation and support policy              | Exact tested baseline documented in the package README                                    |
| 8. Complete Phase 6C gate and evidence record             | Open: manual review plus full Phase 6A–6C gate deferred by owner on 2026-11-22            |

## Scope

Phase 6C covers:

- Node.js and pnpm compatibility;
- React and React DOM peer compatibility;
- TypeScript declaration consumption through public package paths;
- client-rendered and server-rendered consumer builds;
- SSR-safe imports and client hydration;
- Chromium, Firefox, and WebKit interaction behavior;
- automated accessibility checks and selected manual assistive-technology
  review;
- keyboard, focus, live-region, zoom, forced-colors, reduced-motion, theme,
  direction, and responsive behavior; and
- package archive, stylesheet, JavaScript, declaration, and representative
  consumer bundle sizes.

## Non-goals

Phase 6C does not:

- publish the package or change `private: true`;
- add release automation, versioning, or publication credentials;
- add router, data-fetching, persistence, authorization, or workflow APIs;
- create framework-specific Luna adapters;
- claim support for untested package managers, framework versions, browser
  versions, or assistive-technology combinations; or
- reopen completed component scope solely to increase matrix breadth.

## Existing evidence and gaps

| Area                             | Existing evidence                                                                                                                                       | Gap before support can be claimed                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Package artifact                 | Phase 6A builds ESM, declarations, maps, `styles.css`, and `theme.css`; strict `publint`, archive inspection, and ATTW run against the packed artifact. | Retain the gate across every approved compatibility entry and add reviewed size budgets.                             |
| Node.js and pnpm                 | Package smoke and packed fixtures pass on Node.js `24.22.3` and `26.5.0` with pnpm `12.4.2`.                                                            | Repeat the exact commands in CI during Phase 6D; no additional runtime or package-manager claim is implied.          |
| React                            | The exact `19.2.8` peers pass duplicate-React, client mount, SSR, hydration, controlled input, and portal interaction checks.                           | Test every proposed peer range entry before broadening the exact peer declaration.                                   |
| TypeScript                       | Packed declarations pass TypeScript `7.0.2`, strict `Bundler` and `NodeNext`, with `skipLibCheck: false`.                                               | Lower versions remain unsupported until independently tested.                                                        |
| Client rendering                 | The packed Vite `8.3.0` consumer builds, mounts in Chromium, loads Luna styles, and handles stateful interaction.                                       | Additional client frameworks are unsupported.                                                                        |
| Server rendering                 | The packed Next.js `16.3.4` fixture builds, prerenders, starts, hydrates, and exercises controlled and portaled components without browser errors.      | Additional SSR frameworks are unsupported.                                                                           |
| Browser interaction              | The tagged reference set passes with Playwright `1.63.0` in Chromium `153.0.8010.12`, Firefox `155.0`, and WebKit `26.6`.                               | Browser versions outside these recorded revisions are not part of the exact evidence claim.                          |
| Accessibility automation         | The reference, forced-colors, reduced-motion, and 320 px suites pass with Storybook accessibility failures configured as errors.                        | Complete manual screen-reader and 200% browser-zoom review.                                                          |
| Theme and RTL                    | Phase 6B records light/dark, LTR/RTL, portal, keyboard, 320 px, and rendered checks.                                                                    | Carry the representative matrix into cross-engine and accessibility coverage without duplicating the entire catalog. |
| Reduced motion                   | The reference set and packed hydration fixture pass with `prefers-reduced-motion: reduce`, including overlay cleanup.                                   | Manual confirmation remains part of the final review.                                                                |
| Forced colors and screen readers | Forced-colors automation found and fixed missing system-color tokens/focus fallback; the preference suite now passes.                                   | Record an actual desktop screen-reader pairing and manual forced-colors review.                                      |
| Size                             | Package artifacts and Vite/Next client/server fixture outputs are measured against reviewed 10% headroom budgets.                                       | Budget increases require the documented review procedure.                                                            |

## Ownership boundaries retained from Phase 5E

Luna continues to own semantic presentation, controlled primitive behavior,
responsive composition, visible focus treatment, accessible relationships, and
generic data states.

Applications continue to own routing, navigation focus policy, live
announcements for route-like changes, data access, formatting, localization,
validation rules, persistence, authorization, and workflow execution. Phase 6C
fixtures may simulate these application responsibilities only to validate the
package boundary; they must not export new Luna application abstractions.

## Reuse, replacement, and deferral decisions

| Decision | Items                                                                                                                                                                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reuse    | The Phase 6A packed-archive smoke test, public import paths, strict declaration checks, workspace Next.js applications, Storybook interaction stories, Playwright provider, a11y addon, Phase 6B matrix stories, and existing manual responsive/keyboard procedures.                             |
| Extend   | Generate isolated client and SSR fixtures from the packed archive; add hydration and browser-global guards; run a curated reference suite in Chromium, Firefox, and WebKit; add forced-colors/reduced-motion checks; record manual accessibility evidence; and add deterministic size reporting. |
| Replace  | Replace exact-version assumptions and undocumented browser expectations with a matrix whose entries link to repeatable commands and results. Replace the stylesheet minimum-size sanity check with reviewed baselines and upper budgets while retaining the sanity check.                        |
| Defer    | Additional frameworks, legacy browsers, untested screen readers, non-pnpm package managers, React majors outside the approved peer matrix, and automated release/publication work. A deferred entry is unsupported, not implicitly compatible.                                                   |

## Candidate compatibility matrix

The entries below are candidates, not support claims. An entry moves to
**Supported** only after its evidence command and result are recorded in this
document.

### Runtime and package tooling

| Surface                           | Supported entry     | Evidence                                                                                                           | Status      |
| --------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------- |
| Node.js                           | `24.22.3`, `26.5.0` | Packed package smoke and generated Vite/Next fixture commands passed under both recorded runtimes                  | Supported   |
| pnpm                              | `12.4.2`            | Declared package manager installed every generated packed-archive consumer                                         | Supported   |
| React / React DOM                 | `19.2.8`            | Exact peers passed single-React resolution, client mount, SSR, hydration, controlled input, and portal interaction | Supported   |
| TypeScript                        | `7.0.2`             | Packed public declarations pass strict `Bundler` and `NodeNext` with `skipLibCheck: false`                         | Supported   |
| Additional TypeScript lower bound | None                | No lower version was tested; the support claim remains exact rather than inferred                                  | Unsupported |

The React peer range must remain exact until testing justifies a broader range.
Dependency metadata alone is not compatibility evidence.

### Consumer frameworks

| Rendering contract          | Supported fixture                                    | Evidence                                                                                                              | Status    |
| --------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------- |
| Client-rendered SPA         | Vite `8.3.0`, installed from the package archive     | Production build, stylesheet resolution, browser mount, stateful interaction, and no duplicate React                  | Supported |
| Server-rendered application | Next.js `16.3.4`, installed from the package archive | Production build, server prerender/start, stylesheet loading, and no browser-global exception during server execution | Supported |
| Hydrated application        | Next.js `16.3.4` packed-archive fixture              | Server markup hydrates without console/page errors; a controlled field and portaled dialog remain interactive         | Supported |
| Vite SSR smoke              | Vite `8.3.0` generated package consumer              | Static render bundle executes under Node and remains the fast package-level guard                                     | Supported |

Framework versions become supported only at the exact versions recorded by the
fixture lockfile and evidence run. “Next.js” or “Vite” without a tested version
is not a support statement.

### Browser engines

| Engine   | Recorded revision                                   | Coverage                                                               | Status    |
| -------- | --------------------------------------------------- | ---------------------------------------------------------------------- | --------- |
| Chromium | Chrome for Testing `153.0.8010.12`, revision `1243` | Reference set, packed hydration fixture, preferences, and 320 px suite | Supported |
| Firefox  | Firefox `155.0`, revision `1543`                    | Reference set, packed hydration fixture, and 320 px suite              | Supported |
| WebKit   | WebKit `26.6`, revision `2359`                      | Reference set, packed hydration fixture, and 320 px suite              | Supported |

WebKit evidence is recorded on macOS, the WebKit port Safari ships. CI runs the
WebKit suites on a macOS runner; the Linux GTK/WPE port leaves Base UI overlays
mounted after their exit animation and is not part of the support claim.

The full catalog does not need to run three times when a smaller reference set
covers the shared primitives and highest-risk integrations. The reference set
must be documented and must include at least:

- form controls and validation;
- select/combobox, menu, popover, tooltip, dialog, sheet, and toast portals;
- data table scrolling, selection, filtering, and pagination;
- cartesian and distribution charts;
- application shell/sidebar behavior;
- light/dark and LTR/RTL matrix stories; and
- the cross-pattern overview → detail → edit flow.

## TypeScript declaration matrix

Declaration fixtures must import only:

```ts
import { Button, DirectionProvider } from "@withalif/luna";
import "@withalif/luna/styles.css";
```

The authoring-only CSS contract may additionally resolve
`@withalif/luna/theme.css`. Private `src/` imports must continue to fail.

Each approved TypeScript entry must run with:

- `strict: true`;
- `skipLibCheck: false`;
- `jsx: "react-jsx"`;
- the approved target/lib set; and
- at least the `Bundler` and `NodeNext` module-resolution modes when the fixture
  contract makes that mode meaningful.

Passing with `skipLibCheck: true` does not qualify as declaration evidence.

## Accessibility matrix

### Automated coverage

The automated gate must:

- run the approved Storybook reference set with accessibility checks configured
  as errors;
- report zero serious or critical violations;
- preserve semantic role/name/state assertions already present in play tests;
- exercise both light and dark themes and both LTR and RTL where presentation or
  behavior changes;
- verify keyboard opening, navigation, Escape, focus trapping, and trigger-focus
  restoration for portaled controls;
- verify polite/assertive live announcements used by the reference patterns;
- verify no page-level overflow at 320 px while dense tables retain an internal
  labelled scroll region;
- emulate `forced-colors: active` for the selected control, status, chart, and
  focus stories; and
- emulate `prefers-reduced-motion: reduce` and confirm movement/animation is
  removed without hiding state changes or preventing overlay cleanup.

Automated checks supplement rather than replace manual keyboard and assistive
technology review.

### Manual review candidates

The final document must record the date, reviewer, operating system, browser,
browser version, assistive technology, and story/fixture URL for every manual
run.

| Review         | Required procedure                                                                                                                                                               | Status                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Keyboard-only  | Traverse the reference flow without a pointer; verify visible focus, logical order, no traps, Escape behavior, and restoration after overlays.                                   | Automated interactions pass; manual traversal still required           |
| Screen reader  | Use one approved desktop browser/screen-reader pairing to verify landmarks, headings, names, descriptions, validation, table navigation, live regions, and dialog announcements. | Open; recommended pairing is macOS VoiceOver with Chrome               |
| 200% zoom      | Use browser zoom rather than only device scale; verify reflow, readable text, reachable controls, and no page-level horizontal overflow except labelled data regions.            | Open; automation deliberately does not substitute device scale         |
| 320 px layout  | Review light/dark and LTR/RTL reference flows; verify tables scroll internally.                                                                                                  | Three-engine automated suite passed; Phase 6B rendered review retained |
| Forced colors  | Review focus, selected/invalid/disabled states, status meaning, charts, and non-color cues in the approved environment.                                                          | Emulation passed after system-color/focus fallback fix; manual open    |
| Reduced motion | Verify overlays, sidebar, loading states, charts, and disclosure indicators remain understandable with reduced motion.                                                           | Emulation and overlay cleanup passed; manual open                      |
| Theme and RTL  | Repeat the highest-risk portal, table, navigation, and chart checks in dark/RTL.                                                                                                 | Automated matrix passed; Phase 6B rendered review retained             |

For the remaining manual run, use macOS `26.6.2` on arm64 with Chrome
`158.0.8127.36` and VoiceOver. Record the reviewer and date after checking the
tagged `phase6c-reference` stories through Storybook. This recommended pairing
is not a support claim until a human completes and records the run.

Use [Phase 6C — Manual Accessibility Review](PHASE_6C_MANUAL_ACCESSIBILITY_REVIEW.md)
as the required checklist and sign-off record.

## SSR and hydration contract

The server-side gate must fail if importing the public package or rendering a
server-safe composition reads `window`, `document`, `navigator`, storage,
`matchMedia`, or layout APIs during module evaluation or server render.
Client-only behavior may read browser APIs after mount.

The hydration gate must:

1. render representative Luna markup on the server;
2. hydrate the same tree in a browser;
3. capture `console.error`, recoverable hydration errors, and uncaught page
   errors;
4. fail on Luna-owned markup mismatches;
5. interact with at least one controlled field and one portaled component after
   hydration; and
6. verify the runtime stylesheet and public theme/direction contract are active.

## Size baseline and budget policy

Phase 6C must add a deterministic report for:

- packed archive bytes;
- unpacked `dist/` bytes;
- `styles.css` raw and gzip bytes;
- public JavaScript raw and gzip bytes, reported both as the public index and as
  a representative tree-shaken consumer entry;
- declaration and declaration-map bytes; and
- representative client and SSR fixture output.

Package artifact and representative client/SSR fixture budgets are active from
the measured baselines below. Every initial budget includes 10% headroom
rather than copying the current output as an unlimited allowance. A change that
exceeds an active budget must fail the gate unless the same review updates the
baseline with:

- the old and new measurements;
- the absolute and percentage difference;
- the reason for the increase; and
- the reviewer-approved new budget.

Generated build directories and temporary fixtures must not be committed.

### Initial package artifact baseline — 2026-11-22

The initial report uses the current Phase 6B package build and a 10% budget
headroom recorded in `package-size-budget.json`.

| Metric                      | Baseline raw | Baseline gzip | Maximum raw | Maximum gzip |
| --------------------------- | -----------: | ------------: | ----------: | -----------: |
| Packed archive              |    215,288 B |             — |   236,817 B |            — |
| Unpacked `dist/`            |  1,024,952 B |             — | 1,127,448 B |            — |
| Runtime stylesheet          |     89,905 B |      14,420 B |    98,896 B |     15,863 B |
| Public index JavaScript     |     11,262 B |       2,089 B |    12,389 B |      2,298 B |
| All JavaScript modules      |    280,453 B |      96,360 B |   308,499 B |    105,997 B |
| TypeScript declarations     |     93,460 B |      38,593 B |   102,807 B |     42,453 B |
| TypeScript declaration maps |     77,969 B |      31,674 B |    85,766 B |     34,842 B |

Run `pnpm --filter @withalif/luna run size:report` to inspect current values or
`pnpm --filter @withalif/luna run size:check` to enforce every recorded package
artifact budget. The packed archive and temporary measurement directory are
created outside the repository and removed after the run.

### Representative consumer fixture baseline — 2026-11-22

The packed Vite `8.3.0` and Next.js `16.3.4` fixture budget is recorded in
`apps/docs/phase6c-fixture-size-budget.json` and enforced by
`pnpm --filter docs run test:phase6c:fixture`.

| Fixture output         | Baseline raw | Baseline gzip | Maximum raw | Maximum gzip |
| ---------------------- | -----------: | ------------: | ----------: | -----------: |
| Vite client JavaScript |    274,618 B |      79,710 B |   302,080 B |     87,681 B |
| Vite runtime CSS       |     74,361 B |      13,764 B |    81,798 B |     15,141 B |
| Next client JavaScript |    800,791 B |     224,554 B |   880,871 B |    247,010 B |
| Next server JavaScript |    782,150 B |     194,520 B |   860,365 B |    213,972 B |

The Next measurements intentionally include the representative framework
fixture rather than claiming that every byte belongs to Luna. Their purpose is
to catch unexpected integration growth while the framework and fixture remain
pinned.

## Support and end-of-support policy

- Support claims list exact tested versions or bounded ranges derived from
  tested endpoints.
- The repository's Node.js engine, package-manager version, peer ranges, and
  documentation must agree with the approved matrix.
- Dropping a supported entry requires a documented compatibility failure,
  maintenance constraint, or upstream end-of-life decision and a changelog
  entry.
- Adding a version requires the same evidence as the existing entries; a wider
  semver range alone is insufficient.
- An unlisted runtime, framework, browser, package manager, TypeScript version,
  or assistive-technology pairing is unsupported rather than silently covered.
- Security fixes may narrow support before a normal deprecation window, but the
  reason and migration guidance must be recorded.

## Implementation order

1. Measure the current archive, dist, CSS, JavaScript, declarations, and
   representative fixture outputs; propose reviewed budgets.
2. Refactor the Phase 6A generated smoke consumer only as needed to share safe
   archive/fixture helpers without weakening its clean temporary-directory
   boundary.
3. Add public declaration fixtures and execute the candidate TypeScript matrix.
4. Add isolated Vite client and Next.js SSR/hydration fixtures installed from
   the packed archive.
5. Define the Storybook compatibility reference set and run it in Chromium,
   Firefox, and WebKit.
6. Add automated accessibility, forced-colors, reduced-motion, overflow, and
   hydration assertions.
7. Run and record the manual keyboard, screen-reader, 200% zoom, responsive,
   forced-colors, reduced-motion, theme, and RTL checklist.
8. Update package/root documentation and metadata to match only the matrix that
   passed.
9. Run the complete Phase 6A–6C gate and record final evidence before marking
   this document complete.

## Validation commands

The implementation may add focused commands, but the final gate must preserve:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm --filter @withalif/luna run test:package
pnpm build-storybook
```

Phase 6C must additionally provide repeatable commands for:

- the runtime and TypeScript matrix;
- client, SSR, and hydration fixtures;
- Chromium, Firefox, and WebKit reference tests;
- automated accessibility states;
- size reporting and budget enforcement; and
- any manual setup that cannot run in CI.

The focused automated commands are:

```sh
pnpm --filter @withalif/luna run test:package
pnpm --filter @withalif/luna run size:check
pnpm --filter docs run test:phase6c:fixture
pnpm --filter docs run test:phase6c:browser
pnpm --filter docs run test:phase6c:preferences
pnpm --filter docs run test:phase6c:narrow
```

Run the package and fixture commands again with Node.js `24.22.3` active to
reproduce the minimum-runtime evidence. Playwright `1.63.0` requires the pinned
browser binaries, installed with
`pnpm --filter docs exec playwright install chromium firefox webkit`.

## Acceptance checklist

- [x] Every supported matrix entry has a repeatable evidence command and a
      recorded result.
- [x] Unsupported or untested entries are documented without ambiguous support
      language.
- [x] Packed public imports do not access browser globals during server import
      or render.
- [x] Client hydration completes without Luna-owned mismatch warnings.
- [x] Public declarations resolve under every supported TypeScript entry and
      approved module-resolution mode.
- [x] The compatibility reference set passes in Chromium, Firefox, and WebKit.
- [x] Automated accessibility checks report zero serious or critical
      violations.
- [ ] Keyboard order, focus restoration, live announcements, screen-reader
      output, 200% zoom, 320 px layouts, forced colors, reduced motion, themes,
      and RTL pass the documented review.
- [x] Archive, artifact, CSS, JavaScript, declaration, and fixture sizes stay
      within reviewed budgets.
- [x] Consumer documentation and package metadata match the evidence-backed
      matrix.
- [ ] Phase 6A and 6B gates remain green.

## Evidence record

Do not mark an item passed without linking it to output or a dated manual
record.

| Gate                                | Command or procedure                                                                   | Result                                                                       | Evidence date |
| ----------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| Runtime/package-manager matrix      | Package smoke and fixture commands under Node.js `24.22.3` and `26.5.0`, pnpm `12.4.2` | Passed                                                                       | 2026-11-22    |
| React client/SSR/hydration          | `pnpm --filter docs run test:phase6c:fixture`                                          | Vite mount and Next build/prerender/hydration/interactions passed            | 2026-11-22    |
| TypeScript declarations             | `pnpm --filter @withalif/luna run test:package` (`Bundler` and `NodeNext`)             | TypeScript `7.0.2` passed; lower versions explicitly unsupported             | 2026-11-22    |
| Chromium reference suite            | `pnpm --filter docs run test:phase6c:browser`                                          | Passed as part of 66 reference checks                                        | 2026-11-22    |
| Firefox reference suite             | `pnpm --filter docs run test:phase6c:browser`                                          | Passed as part of 66 reference checks                                        | 2026-11-22    |
| WebKit reference suite              | `pnpm --filter docs run test:phase6c:browser`                                          | Passed as part of 66 reference checks                                        | 2026-11-22    |
| Automated accessibility             | Browser reference, preferences, and narrow commands                                    | 66 reference, 44 preference, and 9 narrow checks passed                      | 2026-11-22    |
| Manual accessibility                | Keyboard, VoiceOver, browser 200% zoom, forced-colors, and reduced-motion procedure    | Open; automated and Phase 6B rendered evidence do not replace the manual run | —             |
| Package and fixture size budgets    | `size:check` plus `test:phase6c:fixture`                                               | Passed with active 10% package and fixture budgets                           | 2026-11-22    |
| Complete workspace and package gate | Full Phase 6A–6C validation gate                                                       | Explicitly deferred by owner on 2026-11-22                                   | —             |

## Deferred to Phase 6D

- CI release orchestration and protected publication jobs;
- version/tag/changelog automation;
- provenance, registry credentials, release approvals, and rollback mechanics;
  and
- the private-versus-public publication decision.

Phase 6C completion does not authorize package publication.
