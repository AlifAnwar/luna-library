import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";

import { createReleaseArchive } from "./release-archive.mjs";

const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

function createFixture() {
  const rootDir = mkdtempSync(path.join(tmpdir(), "luna-release-archive-"));
  temporaryDirectories.push(rootDir);
  mkdirSync(path.join(rootDir, "packages/ui"), { recursive: true });
  writeFileSync(
    path.join(rootDir, "packages/ui/package.json"),
    JSON.stringify({ name: "@withalif/luna", version: "0.6.0" }),
  );
  return rootDir;
}

test("packs, validates, sizes, digests, and summarizes one archive", () => {
  const rootDir = createFixture();
  const outputDir = path.join(rootDir, "release-artifacts");
  const archiveContents = Buffer.from("reviewed archive");
  const calls = [];

  const result = createReleaseArchive({
    rootDir,
    outputDir,
    runCommand(command, arguments_, cwd) {
      calls.push({ command, arguments_, cwd });
      if (command === "pnpm" && arguments_[0] === "pack") {
        writeFileSync(
          path.join(outputDir, "withalif-luna-0.6.0.tgz"),
          archiveContents,
        );
      } else if (
        command === "node" &&
        arguments_[0] === "scripts/package-size-report.mjs"
      ) {
        writeFileSync(
          path.join(outputDir, "package-size-report.txt"),
          "Package size budgets passed\n",
        );
      }
    },
  });

  const expectedHash = createHash("sha256")
    .update(archiveContents)
    .digest("hex");
  assert.equal(result.archive, "withalif-luna-0.6.0.tgz");
  assert.equal(result.sha256, expectedHash);
  assert.equal(result.archiveBytes, archiveContents.byteLength);
  assert.equal(calls.length, 3);

  const archivePath = path.join(outputDir, result.archive);
  assert.deepEqual(calls[1].arguments_, [
    "scripts/package-smoke-test.mjs",
    "--archive",
    archivePath,
  ]);
  assert.deepEqual(calls[2].arguments_, [
    "scripts/package-size-report.mjs",
    "--check",
    "--archive",
    archivePath,
    "--output",
    path.join(outputDir, "package-size-report.txt"),
  ]);

  assert.equal(
    readFileSync(path.join(outputDir, result.digest), "utf8"),
    `${expectedHash}  ${result.archive}\n`,
  );
  assert.deepEqual(
    JSON.parse(
      readFileSync(path.join(outputDir, "release-summary.json"), "utf8"),
    ),
    {
      schemaVersion: 1,
      package: "@withalif/luna",
      version: "0.6.0",
      archive: result.archive,
      archiveBytes: archiveContents.byteLength,
      sha256: expectedHash,
      digest: result.digest,
      node: process.version,
      packageInspection: "passed",
      packageSizeBudgets: "passed",
    },
  );
});

test("refuses to use the repository root as the artifact directory", () => {
  const rootDir = createFixture();

  assert.throws(
    () => createReleaseArchive({ rootDir, outputDir: rootDir }),
    /cannot be its root/,
  );
});

test("refuses to overwrite a non-empty artifact directory", () => {
  const rootDir = createFixture();
  const outputDir = path.join(rootDir, "release-artifacts");
  mkdirSync(outputDir);
  writeFileSync(path.join(outputDir, "existing.txt"), "keep\n");

  assert.throws(
    () => createReleaseArchive({ rootDir, outputDir }),
    /must be empty/,
  );
});

test("fails when size validation does not create its report", () => {
  const rootDir = createFixture();
  const outputDir = path.join(rootDir, "release-artifacts");

  assert.throws(
    () =>
      createReleaseArchive({
        rootDir,
        outputDir,
        runCommand(command, arguments_) {
          if (command === "pnpm" && arguments_[0] === "pack") {
            writeFileSync(
              path.join(outputDir, "withalif-luna-0.6.0.tgz"),
              "archive",
            );
          }
        },
      }),
    /did not create its report file/,
  );
});
