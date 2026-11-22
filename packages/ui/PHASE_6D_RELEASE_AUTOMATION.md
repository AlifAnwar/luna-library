# Phase 6D — Release Automation and Publication Gate

Status: implementation in progress since 2026-11-22; metadata, clean-tree,
archive, workflow, and release-procedure foundations are implemented, with the
first clean CI run and external repository settings pending.

Gate: **blocked by Phase 6C**. Release automation may be implemented and
reviewed on this branch, but the release gate cannot be approved and no
publication path may be enabled until the Phase 6C manual accessibility review
and full Phase 6A–6C validation gate are complete or a reviewed owner decision
changes that policy.

## Purpose

Phase 6D turns Luna's manual release checklist into a reproducible,
least-privilege CI pipeline. It must produce a reviewable package archive from
a clean protected branch, prove that the archive satisfies the contracts from
Phases 6A–6C, and keep publication separate from validation.

The default release target remains an internal GitHub artifact. This phase does
not authorize npm publication, public distribution, credential creation, tag
creation from pull requests, or removal of `private: true`.

## Progress

| Step                                                                      | Status                                     |
| ------------------------------------------------------------------------- | ------------------------------------------ |
| 1. Audit existing release capabilities and ownership                      | Complete                                   |
| 2. Record versioning, changelog, archive, and publication decisions       | Complete                                   |
| 3. Add deterministic metadata and clean-tree checks                       | Complete                                   |
| 4. Compose the complete local release gate                                | Implemented; clean-checkout run pending    |
| 5. Add the least-privilege CI release gate                                | Implemented; first CI run pending          |
| 6. Generate and retain a reviewable package archive                       | Local archive passed; CI retention pending |
| 7. Document branch protection, rollback, security, and emergency releases | Complete                                   |
| 8. Reproduce the release from a clean checkout and record evidence        | Not started                                |

## Scope

Phase 6D covers:

- the version source of truth and synchronization rules for package metadata,
  changelog sections, and Git tags;
- deterministic release validation from a clean checkout;
- pull-request and protected-branch release gates;
- a reviewable `@withalif/luna` package archive and validation reports;
- artifact retention, provenance boundaries, and minimum workflow permissions;
- branch-protection and environment-approval requirements;
- private release, rollback, deprecation, and emergency-patch procedures;
- the decision gate required before any future public npm publication; and
- independent visibility for Storybook deployment and package readiness.

## Non-goals

Phase 6D does not:

- publish `@withalif/luna` to npm;
- remove or bypass `private: true`;
- create npm, GitHub, cloud, or signing credentials;
- change repository protection or environment settings through code;
- create release tags from pull-request workflows;
- infer that a passing package gate closes the open Phase 6C manual review;
- replace the package, compatibility, accessibility, or size contracts from
  Phases 6A–6C; or
- add product components, application behavior, or broader compatibility
  claims.

## Existing capabilities and gaps

| Area                            | Existing capability                                                                                        | Gap for Phase 6D                                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Local release gate              | Root `release:check` runs lint, types, tests, application builds, package validation, and Storybook build. | Add formatting/clean-tree enforcement, explicit size checks, Phase 6C suites, metadata consistency, and archive output.             |
| Package artifact                | Phase 6A builds, packs, inspects, and installs the package in isolated client and SSR fixtures.            | Preserve the exact reviewed `.tgz` as a CI artifact and prove the uploaded archive is the validated archive.                        |
| Compatibility and accessibility | Phase 6C provides browser, preference, narrow-layout, hydration, declaration, and size commands.           | Run the approved automated matrix in CI and retain the open manual gate as a release blocker.                                       |
| Versioning                      | Root and UI package versions are both `0.5.0`; releases use `v<version>` tags.                             | Add a deterministic check that the versions, tag, and changelog section agree.                                                      |
| Changelog                       | `CHANGELOG.md` contains `[Unreleased]` and dated release sections.                                         | Fail release preparation when the target version lacks a dated section or comparison links are inconsistent.                        |
| Release procedure               | `RELEASING.md` documents manual preparation, tagging, and Storybook deployment.                            | Add CI evidence, artifact review, rollback, deprecation, emergency patch, retention, security, and publication-decision procedures. |
| CI                              | `deploy-storybook.yml` builds and deploys Storybook from `main`.                                           | Add a separate read-only package release gate; Storybook deployment must remain independent.                                        |
| Publication                     | The root and UI package are private and no publish workflow exists.                                        | Keep publication disabled and document the approvals required before a separate publish workflow may be proposed.                   |

## Release decisions

### Distribution target

The approved Phase 6D target is a **private internal package archive** generated
by GitHub Actions and retained as a workflow artifact. The repository does not
currently approve public npm publication.

The release gate must not run `npm publish`, `pnpm publish`, create a Git tag,
create a GitHub release, or mutate repository settings. A future publication
proposal requires a separate reviewed owner decision covering at least:

- removal of `private: true`;
- package name and registry ownership;
- an approved license and security-reporting path;
- npm trusted publishing or another short-lived identity mechanism;
- a protected GitHub environment with explicit approval;
- provenance and package visibility;
- dry-run evidence from the exact archive; and
- rollback and deprecation behavior for a public immutable registry.

### Version source of truth

`packages/ui/package.json` is the package release version source of truth. The
root `package.json` milestone version must match it while Luna remains a
single-package release. The following identifiers must agree:

1. `packages/ui/package.json` version `X.Y.Z`;
2. root `package.json` version `X.Y.Z`;
3. the dated `CHANGELOG.md` section `[X.Y.Z]`;
4. the changelog comparison link for `[X.Y.Z]`; and
5. a release tag, when present, named exactly `vX.Y.Z`.

Pull requests validate the proposed metadata but never require or create the
future tag. Tag-triggered validation must reject a tag that does not equal the
checked-out package version.

### Changelog workflow

Human-readable release notes remain in `CHANGELOG.md`; no second changelog
system is introduced. Normal changes accumulate under `[Unreleased]`. A release
preparation change moves the approved entries into a dated `[X.Y.Z]` section,
updates comparison links, and leaves a new `[Unreleased]` section in place.

The metadata check must reject:

- missing or duplicate target-version sections;
- a target section without an ISO date;
- version drift between root and UI package metadata;
- a tag/version mismatch;
- malformed or missing repository comparison links; and
- release preparation with no reviewable changelog content.

### CI triggers and permissions

The release gate is expected to run on pull requests, pushes to `main`, and
manual dispatch. Tag validation may be added after the non-mutating gate is
stable. Pull-request and `main` validation use only `contents: read` and must
not receive registry, Pages, or release-write permissions.

Storybook deployment remains in `deploy-storybook.yml` with its existing Pages
permissions. Package validation and Storybook deployment must be reported as
separate checks so one surface cannot hide the status of the other.

### Runtime and package manager

CI must install the repository-declared pnpm `12.4.2` and use a pinned supported
Node.js runtime. The primary release runner is the tested minimum Node.js
`24.22.3`. Compatibility coverage for Node.js `26.5.0` remains part of the
Phase 6C evidence and may run as a separate matrix entry rather than duplicating
every release job.

Every job installs dependencies with `pnpm install --frozen-lockfile`.

### Artifact identity and retention

The gate must create one package archive with `pnpm pack`, record its filename
and SHA-256 digest, validate that exact file, and upload that same file. It must
not rebuild a second unverified archive for upload.

Pull-request artifacts should be retained for 14 days. Artifacts from `main`
and approved release preparation runs should be retained for 90 days, subject
to repository retention limits. The artifact bundle should contain:

- the `.tgz` package archive;
- its SHA-256 digest;
- the package-content inspection result;
- package and representative fixture size reports; and
- a concise release-gate summary.

Generated archives, fixture directories, and reports must remain untracked.

### Branch protection and approvals

Repository administrators must configure, outside this codebase:

- pull requests for changes to `main`;
- required review for workflow and package metadata changes;
- the Phase 6D release-gate check as required;
- protection against force-pushes and tag deletion for release tags;
- a protected publication environment if publication is ever approved; and
- environment reviewers who are not bypassed by pull-request workflows.

The implementation can document and verify expected check names, but it cannot
claim these repository settings are active without administrator evidence.

## Workflow architecture

### Release validation workflow

Add a dedicated workflow with read-only permissions and concurrency scoped to
the commit or pull request. Its jobs should make failures attributable:

1. **metadata** — versions, changelog, tag rules, lockfile, and clean generated
   output;
2. **quality** — formatting check, lint, TypeScript, and unit/browser tests;
3. **builds** — UI package, production applications, and static Storybook;
4. **compatibility** — approved Phase 6C fixture, browser, preference, and
   narrow suites;
5. **package** — pack once, inspect, run isolated consumer smoke tests, and
   enforce package/fixture size budgets; and
6. **artifact** — upload the validated archive and reports after all required
   jobs pass.

Jobs may be consolidated when sharing the exact archive is safer or faster,
but consolidation must not rebuild an artifact after validation.

### Publication workflow

No publication workflow is approved for the private-archive target. If public
publication is approved later, it must be a separate workflow that:

- runs only from the protected default branch or an approved matching tag;
- downloads and verifies the digest of the already validated archive;
- depends on successful Phase 6A–6D gates;
- uses a protected environment and minimum permissions;
- uses trusted publishing/provenance instead of a developer-machine token;
- cannot run for pull requests; and
- never deletes or rewrites an existing release tag.

## Local command contract

The implementation exposes small scripts that CI and humans call identically:

| Command                     | Required behavior                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm release:metadata`     | Validate root/UI versions, changelog structure, repository links, and an optional checked-out tag. |
| `pnpm release:archive`      | Build and create one reviewable archive plus its digest without publishing.                        |
| `pnpm release:check`        | Run the complete non-publishing release gate from a clean checkout.                                |
| `pnpm release:verify-clean` | Fail when tracked generated output changes or release artifacts are accidentally tracked.          |

Exact script names may be adjusted during implementation if existing package
scripts provide a clearer composition. The final names and outputs must be
documented in `RELEASING.md`.

## Execution plan

1. Add metadata validation with focused tests for valid, missing, malformed,
   duplicate, and mismatched release data.
2. Add non-mutating formatting and clean-output checks.
3. Extend `release:check` with package size and the approved Phase 6C automated
   gates while keeping the manual gate explicit.
4. Make archive creation identify and validate one file, then produce a
   SHA-256 digest and report bundle.
5. Add the read-only GitHub Actions release gate and artifact retention rules.
6. Update `RELEASING.md` with private release preparation, artifact review,
   tagging, rollback, deprecation, emergency patch, security, and future public
   publication procedures.
7. Run the workflow-equivalent command sequence from a clean checkout.
8. Record command output, artifact identity, and administrator-owned settings
   in the evidence table.
9. Complete or formally resolve the Phase 6C blockers before approving the
   Phase 6D gate.

## Acceptance checklist

- [x] Existing release scripts, package gates, documentation, and workflows are
      audited.
- [x] The private internal archive is recorded as the default distribution
      target.
- [x] Version, tag, and changelog synchronization rules are documented.
- [x] Metadata validation fails on every documented mismatch.
- [x] The local release gate covers formatting, lint, types, tests, production
      application builds, Storybook, package inspection, isolated consumers,
      compatibility automation, and size budgets.
- [x] Pull-request workflows cannot publish, create tags, write releases, or
      receive publication credentials.
- [ ] CI validates and uploads the same package archive with a recorded digest.
- [x] Generated output and release artifacts cannot leave the repository dirty
      or enter the committed tree unnoticed.
- [ ] A clean checkout reproduces the reviewed archive and validation result.
- [x] Storybook deployment and package release readiness are separate checks.
- [x] `RELEASING.md` documents private release, artifact retention, rollback,
      deprecation, emergency patch, security reporting, and future publication
      approval.
- [ ] Required branch protection and environment settings have administrator
      evidence or are explicitly marked pending.
- [ ] The Phase 6C manual review and complete Phase 6A–6C gate are closed or a
      reviewed owner decision updates the release policy.

## Evidence record

Do not mark an item passed without linking it to command output, a workflow
run, a reviewed repository setting, or a dated manual record.

| Gate                          | Command or procedure                                                             | Result                                                                                                                                                         | Evidence date |
| ----------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Baseline audit                | Inspect package scripts, `CHANGELOG.md`, `RELEASING.md`, and `.github/workflows` | Complete; reusable capabilities and gaps recorded above                                                                                                        | 2026-11-22    |
| Metadata consistency          | `pnpm release:metadata` and `pnpm test:release-metadata`                         | Repository metadata and 12 positive/negative fixtures passed                                                                                                   | 2026-11-22    |
| Clean-tree enforcement        | `pnpm release:verify-clean` and `pnpm test:release-clean`                        | Six clean, dirty, staged, untracked, archive, and digest fixture checks passed                                                                                 | 2026-11-22    |
| Complete local release gate   | `pnpm release:check`                                                             | Command composed; clean-checkout end-to-end run pending                                                                                                        | —             |
| CI release gate               | `.github/workflows/release-gate.yml` and `pnpm test:release-workflow`            | Read-only workflow implemented; four contract checks passed; first GitHub run pending                                                                          | 2026-11-22    |
| Reviewable package artifact   | `pnpm release:archive`                                                           | Exact 216,221-byte archive passed inspection, isolated consumers, and size budgets; SHA-256 `5a283573bc4a7fdc7cdc011212683935f9bcc45f80bc74949a2407ee56aa1d80` | 2026-11-22    |
| Clean-checkout reproduction   | Documented checkout and gate procedure                                           | Not run                                                                                                                                                        | —             |
| Branch/environment protection | Administrator review                                                             | Pending external evidence                                                                                                                                      | —             |
| Phase 6C prerequisite         | Manual review and full Phase 6A–6C gate                                          | Open                                                                                                                                                           | —             |

## Deferred beyond the private Phase 6D target

- public npm publication;
- package visibility or name changes;
- npm trusted-publishing configuration;
- automated release-tag or GitHub Release creation;
- cryptographic signing beyond registry/GitHub provenance mechanisms;
- support for registries other than an explicitly approved npm target; and
- multi-package independent versioning.

Deferral means the capability is not approved or supported. A later proposal
must not infer publication authority from the existence of a passing private
release gate.
