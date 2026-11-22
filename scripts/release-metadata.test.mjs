import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";

import {
  ReleaseMetadataError,
  validateReleaseMetadata,
} from "./release-metadata.mjs";

const temporaryDirectories = [];
const repositoryUrl = "https://github.com/AlifAnwar/luna-library";

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

function validChangelog({
  date = "2026-11-22",
  releaseBody = "### Added\n\n- Release automation.",
  releaseLink = `${repositoryUrl}/compare/v0.5.0...v0.6.0`,
  version = "0.6.0",
} = {}) {
  return `# Changelog

## [Unreleased]

## [${version}] - ${date}

${releaseBody}

[Unreleased]: ${repositoryUrl}/compare/v${version}...HEAD
[${version}]: ${releaseLink}
`;
}

function createFixture({
  changelog = validChangelog(),
  rootVersion = "0.6.0",
  uiVersion = "0.6.0",
} = {}) {
  const rootDir = mkdtempSync(path.join(tmpdir(), "luna-release-metadata-"));
  temporaryDirectories.push(rootDir);
  mkdirSync(path.join(rootDir, "packages/ui"), { recursive: true });
  writeFileSync(
    path.join(rootDir, "package.json"),
    JSON.stringify({ name: "luna-library", version: rootVersion }),
  );
  writeFileSync(
    path.join(rootDir, "packages/ui/package.json"),
    JSON.stringify({
      name: "@withalif/luna",
      repository: {
        type: "git",
        url: `git+${repositoryUrl}.git`,
        directory: "packages/ui",
      },
      version: uiVersion,
    }),
  );
  writeFileSync(path.join(rootDir, "CHANGELOG.md"), changelog);
  return rootDir;
}

function expectIssues(options, expectedIssues) {
  assert.throws(
    () => validateReleaseMetadata(options),
    (error) => {
      assert.ok(error instanceof ReleaseMetadataError);
      for (const expectedIssue of expectedIssues) {
        assert.ok(
          error.issues.some((issue) => issue.includes(expectedIssue)),
          `Expected an issue containing ${JSON.stringify(expectedIssue)}; received:\n${error.issues.join("\n")}`,
        );
      }
      return true;
    },
  );
}

test("accepts synchronized package, changelog, repository, and tag metadata", () => {
  const rootDir = createFixture();

  assert.deepEqual(validateReleaseMetadata({ rootDir, tag: "v0.6.0" }), {
    changelogDate: "2026-11-22",
    repositoryUrl,
    tag: "v0.6.0",
    version: "0.6.0",
  });
});

test("reports root and UI package version drift", () => {
  const rootDir = createFixture({ rootVersion: "0.5.0" });

  expectIssues({ rootDir }, ["does not match UI package version"]);
});

test("requires a stable package version", () => {
  const rootDir = createFixture({
    changelog: validChangelog({ version: "0.6.0-beta.1" }),
    rootVersion: "0.6.0-beta.1",
    uiVersion: "0.6.0-beta.1",
  });

  expectIssues({ rootDir }, ["must be a stable X.Y.Z version"]);
});

test("requires exactly one dated release section", () => {
  const rootDir = createFixture({
    changelog: `${validChangelog()}\n## [0.6.0] - 2026-11-22\n\n- Duplicate.\n`,
  });

  expectIssues({ rootDir }, ["exactly one ## [0.6.0] release section"]);
});

test("rejects a missing target release section", () => {
  const rootDir = createFixture({
    changelog: `# Changelog

## [Unreleased]

- Pending change.

[Unreleased]: ${repositoryUrl}/compare/v0.6.0...HEAD
`,
  });

  expectIssues({ rootDir }, ["exactly one ## [0.6.0] release section"]);
});

test("rejects an impossible release date", () => {
  const rootDir = createFixture({
    changelog: validChangelog({ date: "2026-02-30" }),
  });

  expectIssues({ rootDir }, ["must use a real ISO date"]);
});

test("requires reviewable release entries", () => {
  const rootDir = createFixture({
    changelog: validChangelog({ releaseBody: "### Added" }),
  });

  expectIssues({ rootDir }, ["at least one reviewable list entry"]);
});

test("validates release and Unreleased comparison links", () => {
  const rootDir = createFixture({
    changelog: validChangelog({
      releaseLink: `${repositoryUrl}/compare/v0.5.0...v0.7.0`,
    }).replace("compare/v0.6.0...HEAD", "compare/v0.5.0...HEAD"),
  });

  expectIssues({ rootDir }, [
    "must compare a prior stable tag to v0.6.0",
    "[Unreleased] link must be",
  ]);
});

test("rejects missing comparison links", () => {
  const rootDir = createFixture({
    changelog: validChangelog().replace(/^\[[^\n]+$/gm, ""),
  });

  expectIssues({ rootDir }, [
    "exactly one [0.6.0] comparison link; found 0",
    "exactly one [Unreleased] comparison link; found 0",
  ]);
});

test("requires the release comparison to start from a different stable tag", () => {
  const rootDir = createFixture({
    changelog: validChangelog({
      releaseLink: `${repositoryUrl}/compare/v0.6.0...v0.6.0`,
    }),
  });

  expectIssues({ rootDir }, ["must compare a prior stable tag"]);
});

test("requires the UI package repository identity", () => {
  const rootDir = createFixture();
  writeFileSync(
    path.join(rootDir, "packages/ui/package.json"),
    JSON.stringify({
      name: "@withalif/luna",
      repository: "not-a-repository",
      version: "0.6.0",
    }),
  );

  expectIssues({ rootDir }, ["must resolve to an HTTPS GitHub repository URL"]);
});

test("rejects a release tag that does not match the package version", () => {
  const rootDir = createFixture();

  expectIssues({ rootDir, tag: "v0.7.0" }, [
    "does not match package version v0.6.0",
  ]);
});
