import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const rootDir = path.resolve(import.meta.dirname, "..");
const releaseWorkflow = readFileSync(
  path.join(rootDir, ".github/workflows/release-gate.yml"),
  "utf8",
);
const storybookWorkflow = readFileSync(
  path.join(rootDir, ".github/workflows/deploy-storybook.yml"),
  "utf8",
);

test("release validation runs for pull requests, main, and manual dispatch", () => {
  assert.match(releaseWorkflow, /^  pull_request:\n    branches: \[main\]$/m);
  assert.match(releaseWorkflow, /^  push:\n    branches: \[main\]$/m);
  assert.match(releaseWorkflow, /^  workflow_dispatch:$/m);
  assert.match(releaseWorkflow, /run: pnpm release:check/);
});

test("release validation is read-only and contains no publication behavior", () => {
  assert.match(releaseWorkflow, /^permissions:\n  contents: read$/m);
  assert.doesNotMatch(
    releaseWorkflow,
    /^\s+(contents|packages|id-token): write$/m,
  );
  assert.doesNotMatch(releaseWorkflow, /\b(?:npm|pnpm) publish\b/);
  assert.doesNotMatch(releaseWorkflow, /\bgit (?:tag|push)\b/);
  assert.doesNotMatch(releaseWorkflow, /create-release|deploy-pages/);
});

test("release validation uploads the exact artifact directory with bounded retention", () => {
  assert.match(releaseWorkflow, /uses: actions\/upload-artifact@v7/);
  assert.match(releaseWorkflow, /path: release-artifacts\//);
  assert.match(releaseWorkflow, /if-no-files-found: error/);
  assert.match(
    releaseWorkflow,
    /retention-days: \$\{\{ github\.event_name == 'pull_request' && 14 \|\| 90 \}\}/,
  );
});

test("package validation and Storybook deployment remain separate workflows", () => {
  assert.match(releaseWorkflow, /^name: Release Gate$/m);
  assert.doesNotMatch(releaseWorkflow, /deploy-pages/);
  assert.match(storybookWorkflow, /^name: Deploy Storybook$/m);
  assert.match(storybookWorkflow, /deploy-pages/);
  assert.doesNotMatch(storybookWorkflow, /release:check|release-artifacts/);
});
