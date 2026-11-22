import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const FORBIDDEN_TRACKED_ARTIFACTS = [
  /(^|\/)release-artifacts\//,
  /\.sha256$/,
  /\.tgz$/,
];

export class ReleaseCleanError extends Error {
  constructor(issues) {
    super(
      `Release clean-tree validation failed:\n${issues
        .map((issue) => `- ${issue}`)
        .join("\n")}`,
    );
    this.name = "ReleaseCleanError";
    this.issues = issues;
  }
}

function runGit(rootDir, arguments_) {
  const result = spawnSync("git", arguments_, {
    cwd: rootDir,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const detail = result.stderr.trim() || result.stdout.trim();
    throw new Error(
      `git ${arguments_.join(" ")} failed${detail ? `: ${detail}` : ""}`,
    );
  }

  return result.stdout;
}

export function verifyReleaseClean({ rootDir = process.cwd() } = {}) {
  const issues = [];
  const statusLines = runGit(rootDir, [
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ])
    .split("\n")
    .filter(Boolean);

  if (statusLines.length > 0) {
    issues.push(
      `working tree contains tracked, staged, or untracked changes:\n  ${statusLines.join("\n  ")}`,
    );
  }

  const trackedFiles = runGit(rootDir, ["ls-files", "-z"])
    .split("\0")
    .filter(Boolean);
  const forbiddenArtifacts = trackedFiles.filter((file) =>
    FORBIDDEN_TRACKED_ARTIFACTS.some((pattern) => pattern.test(file)),
  );

  if (forbiddenArtifacts.length > 0) {
    issues.push(
      `release artifacts must not be tracked:\n  ${forbiddenArtifacts.join("\n  ")}`,
    );
  }

  if (issues.length > 0) throw new ReleaseCleanError(issues);

  return { trackedFileCount: trackedFiles.length };
}

function parseArguments(argv) {
  const options = { rootDir: process.cwd(), json: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") {
      continue;
    } else if (argument === "--root") {
      const root = argv[index + 1];
      if (!root) throw new Error("--root requires a path");
      options.rootDir = path.resolve(root);
      index += 1;
    } else if (argument === "--json") {
      options.json = true;
    } else if (argument === "--help") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/release-verify-clean.mjs [options]

Options:
  --root <path>  Git repository root to validate (default: current directory)
  --json         Print the validation result as JSON
  --help         Show this help`);
}

function runCli() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const result = verifyReleaseClean(options);
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(
        `Release tree clean: ${result.trackedFileCount} tracked files, no release artifacts tracked`,
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  runCli();
}
