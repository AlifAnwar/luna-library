import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, test } from "node:test";

import {
  ReleaseCleanError,
  verifyReleaseClean,
} from "./release-verify-clean.mjs";

const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

function git(rootDir, arguments_) {
  const result = spawnSync("git", arguments_, {
    cwd: rootDir,
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    0,
    result.stderr || `git ${arguments_.join(" ")} failed`,
  );
}

function createRepository() {
  const rootDir = mkdtempSync(path.join(tmpdir(), "luna-release-clean-"));
  temporaryDirectories.push(rootDir);
  git(rootDir, ["init", "--quiet"]);
  writeFileSync(path.join(rootDir, ".gitignore"), "dist/\n");
  writeFileSync(path.join(rootDir, "README.md"), "# Fixture\n");
  git(rootDir, ["add", "."]);
  git(rootDir, [
    "-c",
    "user.name=Luna Test",
    "-c",
    "user.email=luna@example.invalid",
    "commit",
    "--quiet",
    "-m",
    "fixture",
  ]);
  return rootDir;
}

function expectIssues(rootDir, expectedIssues) {
  assert.throws(
    () => verifyReleaseClean({ rootDir }),
    (error) => {
      assert.ok(error instanceof ReleaseCleanError);
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

test("accepts a clean repository and ignored build output", () => {
  const rootDir = createRepository();
  mkdirSync(path.join(rootDir, "dist"));
  writeFileSync(path.join(rootDir, "dist/index.js"), "export {};\n");

  assert.equal(verifyReleaseClean({ rootDir }).trackedFileCount, 2);
});

test("rejects modified tracked files", () => {
  const rootDir = createRepository();
  writeFileSync(path.join(rootDir, "README.md"), "# Changed\n");

  expectIssues(rootDir, ["working tree contains", "README.md"]);
});

test("rejects staged files", () => {
  const rootDir = createRepository();
  writeFileSync(path.join(rootDir, "CHANGELOG.md"), "# Changelog\n");
  git(rootDir, ["add", "CHANGELOG.md"]);

  expectIssues(rootDir, ["working tree contains", "CHANGELOG.md"]);
});

test("rejects untracked files", () => {
  const rootDir = createRepository();
  writeFileSync(path.join(rootDir, "notes.txt"), "not committed\n");

  expectIssues(rootDir, ["working tree contains", "notes.txt"]);
});

test("rejects tracked package archives even when the tree is otherwise clean", () => {
  const rootDir = createRepository();
  writeFileSync(path.join(rootDir, "luna-0.6.0.tgz"), "archive\n");
  git(rootDir, ["add", "luna-0.6.0.tgz"]);
  git(rootDir, [
    "-c",
    "user.name=Luna Test",
    "-c",
    "user.email=luna@example.invalid",
    "commit",
    "--quiet",
    "-m",
    "track archive",
  ]);

  expectIssues(rootDir, ["release artifacts must not be tracked", ".tgz"]);
});

test("rejects tracked digest and release-artifact directories", () => {
  const rootDir = createRepository();
  mkdirSync(path.join(rootDir, "release-artifacts"));
  writeFileSync(
    path.join(rootDir, "release-artifacts/package.sha256"),
    "hash\n",
  );
  git(rootDir, ["add", "release-artifacts/package.sha256"]);
  git(rootDir, [
    "-c",
    "user.name=Luna Test",
    "-c",
    "user.email=luna@example.invalid",
    "commit",
    "--quiet",
    "-m",
    "track digest",
  ]);

  expectIssues(rootDir, ["release artifacts must not be tracked", ".sha256"]);
});
