# Releasing Luna

Luna currently uses Git tags for internal milestone releases. The
`@withalif/luna` package remains private and must not be published to npm.

## Prepare a release

1. Start from a clean `main` branch that is synchronized with `origin/main`.
2. Set the root and `@withalif/luna` package versions to the release version.
3. Move the relevant changelog entries into a dated release section.
4. Validate that the root/UI versions, dated changelog section, comparison
   links, and optional CI tag agree:

   ```sh
   pnpm release:metadata
   ```

   Tag-triggered CI automatically validates `GITHUB_REF_NAME` as
   `v<package version>`. The equivalent local check is
   `pnpm release:metadata -- --tag v0.5.0`.

5. Run the release gate, which repeats metadata validation and its focused
   tests before the broader checks. It also rejects tracked, staged, or
   untracked changes before the gate and verifies again after generated checks
   finish:

   ```sh
   pnpm install --frozen-lockfile
   pnpm release:check
   ```

   Build output covered by `.gitignore` is allowed. Package archives,
   checksums, and `release-artifacts/` must never be committed.

6. Review the static Storybook output and the cross-pattern application story.
7. Commit the release preparation:

   ```sh
   git commit -m "chore(release): prepare v0.5.0"
   ```

## Review the private package archive

`pnpm release:check` creates `release-artifacts/` only after the package and
application gates pass. To generate the archive separately, start with no
existing `release-artifacts/` directory and run:

```sh
pnpm release:archive
```

The command builds the UI package, packs it once, and runs archive inspection,
ATTW, declaration checks, isolated Vite client/SSR consumers, React peer
identity checks, and size budgets against that exact `.tgz`. It produces:

- `withalif-luna-<version>.tgz`;
- the matching `.sha256` digest;
- `release-summary.json`; and
- `package-size-report.txt`.

Verify a downloaded artifact from inside its directory:

```sh
cd release-artifacts
shasum -a 256 -c withalif-luna-<version>.tgz.sha256
```

The archive directory must be empty before generation. Release commands never
overwrite an existing review artifact, and the directory is intentionally
ignored by Git.

## CI release gate

The `Release Gate` workflow runs for pull requests targeting `main`, pushes to
`main`, and manual dispatch. It uses Node.js `24.22.3`, the repository-declared
pnpm version, frozen dependency installation, and the complete non-publishing
`pnpm release:check` command.

The Linux job runs the Phase 6C browser suites in Chromium and Firefox
(`PHASE6C_ENGINES=chromium,firefox`). A separate macOS job runs the WebKit
reference, 320 px, and packed hydration suites (`PHASE6C_ENGINES=webkit`)
because Safari ships Apple's WebKit port; the Linux GTK/WPE port does not
complete Base UI exit animations and is not part of the support claim. Local
runs without `PHASE6C_ENGINES` exercise all three engines. Set
`PHASE6C_TRACE=1` to keep Playwright traces for failed browser tests.

The workflow has only `contents: read`; it cannot publish packages, write
releases, create tags, or deploy Storybook. After a successful gate it uploads
the validated `release-artifacts/` directory for 14 days on pull requests and
90 days for `main` or manual runs. Storybook continues to use its independent
`Deploy Storybook` workflow.

Repository administrators must require both the `Validate private package archive`
and `Validate WebKit compatibility (macOS)` checks on `main`, require review for workflow/release metadata changes, disable
force-pushes to `main`, and protect release tags from deletion. These settings
must be verified in GitHub; repository files cannot enforce them by themselves.

## Tag the release

Create the tag only after the preparation commit has passed CI and review:

```sh
git tag -a v0.5.0 -m "Release v0.5.0 - Application Patterns"
git push origin main
git push origin v0.5.0
```

Create a GitHub release from the tag and use the matching changelog section as
its release notes.

Do not create a tag until the preparation commit is on protected `main`, the
release gate is green, the archive digest was reviewed, and the open Phase 6C
prerequisites are resolved. Never move, replace, or delete an existing release
tag to correct a release.

## Rollback and faulty releases

Git tags and published GitHub releases are immutable history. If an internal
archive is faulty:

1. Stop distributing the affected workflow artifact and mark the GitHub
   release as affected without deleting it.
2. Revert the faulty change through a reviewed pull request when that is the
   safest restoration path.
3. Prepare a new patch version with a changelog entry that names the affected
   version and remediation.
4. Run the full release gate and review the new archive digest.
5. Create a new tag and GitHub release; do not retag the old commit.

Consumers should pin a previously validated archive until the patch release is
available. Because Luna is not published to npm, registry unpublish and npm
deprecation commands are not part of the current rollback procedure.

## Deprecation

Record deprecated components, props, or package contracts under
`[Unreleased]` and in the eventual dated release section. Include the supported
replacement and the earliest planned removal milestone. A breaking removal
requires its own reviewed milestone; it must not be hidden in release
automation work.

If public npm publication is approved later, the publication proposal must add
an npm deprecation procedure that preserves existing versions and never uses
unpublish as normal rollback.

## Emergency patches

Emergency status does not bypass review, metadata checks, branch protection,
or the release gate:

1. Branch from the last known-good tag or the protected `main` commit selected
   by the repository owner.
2. Apply the minimum fix and add focused regression coverage.
3. Increment the patch version in the root and UI package metadata.
4. Add a dated changelog section and correct comparison links.
5. Open a pull request, obtain the required review, and pass `Release Gate`.
6. Merge to `main`, re-run or confirm the protected-branch gate, then create a
   new immutable patch tag.

## Security reports

Follow [SECURITY.md](SECURITY.md). Do not place suspected vulnerabilities,
credentials, exploit details, or private consumer information in a public
issue. Public package publication remains blocked until a repository
administrator confirms a functioning private reporting path and records that
evidence in the Phase 6D implementation document.

## Publication decision

The approved Phase 6D output is a private GitHub Actions artifact.
`@withalif/luna` remains `private: true`, and no npm publication workflow is
approved. Public publication requires a separate owner decision, approved
license/security path, protected environment approval, trusted publishing,
provenance, successful Phase 6A–6D gates, and a dry run using the already
validated archive.

## Publish Storybook

The `Deploy Storybook` workflow builds and deploys Storybook after a push to
`main`, or when started manually.

Before the first deployment, open the repository's **Settings → Pages** and set
**Source** to **GitHub Actions**. The workflow then manages subsequent
deployments through the `github-pages` environment.
