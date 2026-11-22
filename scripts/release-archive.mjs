import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function run(command, arguments_, cwd, { capture = false } = {}) {
  return execFileSync(command, arguments_, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CI: "1" },
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });
}

function assertSafeOutputDirectory(rootDir, outputDir) {
  const relative = path.relative(rootDir, outputDir);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(
      `Release artifact directory must be inside the repository and cannot be its root: ${outputDir}`,
    );
  }
}

export function createReleaseArchive({
  rootDir = process.cwd(),
  outputDir = path.join(rootDir, "release-artifacts"),
  runCommand = run,
} = {}) {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedOutput = path.resolve(outputDir);
  const packageRoot = path.join(resolvedRoot, "packages/ui");
  assertSafeOutputDirectory(resolvedRoot, resolvedOutput);

  const packageJson = JSON.parse(
    readFileSync(path.join(packageRoot, "package.json"), "utf8"),
  );
  mkdirSync(resolvedOutput, { recursive: true });
  const existingEntries = readdirSync(resolvedOutput);
  if (existingEntries.length > 0) {
    throw new Error(
      `Release artifact directory must be empty: ${resolvedOutput}\nFound: ${existingEntries.join(", ")}`,
    );
  }

  runCommand(
    "pnpm",
    ["pack", "--pack-destination", resolvedOutput],
    packageRoot,
    { capture: true },
  );

  const archives = readdirSync(resolvedOutput).filter((file) =>
    file.endsWith(".tgz"),
  );
  if (archives.length !== 1) {
    throw new Error(
      `Expected exactly one package archive; found ${archives.length}`,
    );
  }

  const archiveFile = archives[0];
  const archivePath = path.join(resolvedOutput, archiveFile);
  const archive = readFileSync(archivePath);
  const sha256 = createHash("sha256").update(archive).digest("hex");
  const digestFile = `${archiveFile}.sha256`;
  writeFileSync(
    path.join(resolvedOutput, digestFile),
    `${sha256}  ${archiveFile}\n`,
    "utf8",
  );

  runCommand(
    "node",
    ["scripts/package-smoke-test.mjs", "--archive", archivePath],
    packageRoot,
  );
  const sizeReportPath = path.join(resolvedOutput, "package-size-report.txt");
  runCommand(
    "node",
    [
      "scripts/package-size-report.mjs",
      "--check",
      "--archive",
      archivePath,
      "--output",
      sizeReportPath,
    ],
    packageRoot,
  );
  if (!existsSync(sizeReportPath) || !statSync(sizeReportPath).isFile()) {
    throw new Error("Package size validation did not create its report file");
  }

  const summary = {
    schemaVersion: 1,
    package: packageJson.name,
    version: packageJson.version,
    archive: archiveFile,
    archiveBytes: statSync(archivePath).size,
    sha256,
    digest: digestFile,
    node: process.version,
    packageInspection: "passed",
    packageSizeBudgets: "passed",
  };
  writeFileSync(
    path.join(resolvedOutput, "release-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );

  return { ...summary, outputDir: resolvedOutput };
}

function parseArguments(argv) {
  const options = { rootDir: process.cwd() };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") {
      continue;
    } else if (argument === "--output") {
      const output = argv[index + 1];
      if (!output) throw new Error("--output requires a directory path");
      options.outputDir = path.resolve(output);
      index += 1;
    } else if (argument === "--help") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/release-archive.mjs [options]

Options:
  --output <path>  Empty artifact directory (default: release-artifacts)
  --help           Show this help`);
}

function runCli() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const result = createReleaseArchive(options);
    console.log(
      `Validated release archive: ${result.archive} (${result.archiveBytes} bytes)\nSHA-256: ${result.sha256}\nArtifacts: ${result.outputDir}`,
    );
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
