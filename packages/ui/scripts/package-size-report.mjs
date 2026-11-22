import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir, realpath, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distDirectory = path.join(packageRoot, "dist");
const budgetPath = path.join(packageRoot, "package-size-budget.json");
const checkBudgets = process.argv.includes("--check");
const jsonOutput = process.argv.includes("--json");
const temporaryPrefix = path.join(os.tmpdir(), "luna-size-report-");
const resolvedTemporaryPrefix = path.join(
  await realpath(os.tmpdir()),
  "luna-size-report-",
);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files.sort();
}

async function measureFiles(files) {
  let rawBytes = 0;
  let gzipBytes = 0;

  for (const file of files) {
    const contents = await readFile(file);
    rawBytes += contents.byteLength;
    gzipBytes += gzipSync(contents, { level: 9 }).byteLength;
  }

  return { rawBytes, gzipBytes };
}

async function createArchive() {
  const { mkdtemp } = await import("node:fs/promises");
  const temporaryRoot = await mkdtemp(temporaryPrefix);

  try {
    execFileSync("pnpm", ["pack", "--pack-destination", temporaryRoot], {
      cwd: packageRoot,
      env: { ...process.env, CI: "1" },
      stdio: ["ignore", "ignore", "inherit"],
    });

    const tarballs = (await readdir(temporaryRoot)).filter((file) =>
      file.endsWith(".tgz"),
    );
    assert.equal(tarballs.length, 1, "Expected exactly one package archive");

    return {
      bytes: (await stat(path.join(temporaryRoot, tarballs[0]))).size,
      temporaryRoot,
    };
  } catch (error) {
    await removeTemporaryRoot(temporaryRoot);
    throw error;
  }
}

async function removeTemporaryRoot(temporaryRoot) {
  const resolvedTemporaryRoot = await realpath(temporaryRoot).catch(
    () => temporaryRoot,
  );
  assert(
    resolvedTemporaryRoot.startsWith(resolvedTemporaryPrefix),
    `Refusing to remove unexpected path: ${resolvedTemporaryRoot}`,
  );
  await rm(resolvedTemporaryRoot, { recursive: true, force: true });
}

function flattenMetrics(metrics) {
  return {
    archiveBytes: metrics.archive.bytes,
    distRawBytes: metrics.dist.rawBytes,
    stylesRawBytes: metrics.styles.rawBytes,
    stylesGzipBytes: metrics.styles.gzipBytes,
    publicIndexRawBytes: metrics.publicIndex.rawBytes,
    publicIndexGzipBytes: metrics.publicIndex.gzipBytes,
    javascriptRawBytes: metrics.javascript.rawBytes,
    javascriptGzipBytes: metrics.javascript.gzipBytes,
    declarationsRawBytes: metrics.declarations.rawBytes,
    declarationsGzipBytes: metrics.declarations.gzipBytes,
    declarationMapsRawBytes: metrics.declarationMaps.rawBytes,
    declarationMapsGzipBytes: metrics.declarationMaps.gzipBytes,
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function printReport(metrics) {
  const rows = [
    ["Packed archive", metrics.archive.bytes, null],
    ["Unpacked dist", metrics.dist.rawBytes, null],
    ["Runtime stylesheet", metrics.styles.rawBytes, metrics.styles.gzipBytes],
    [
      "Public index JavaScript",
      metrics.publicIndex.rawBytes,
      metrics.publicIndex.gzipBytes,
    ],
    [
      "All JavaScript modules",
      metrics.javascript.rawBytes,
      metrics.javascript.gzipBytes,
    ],
    [
      "TypeScript declarations",
      metrics.declarations.rawBytes,
      metrics.declarations.gzipBytes,
    ],
    [
      "Declaration maps",
      metrics.declarationMaps.rawBytes,
      metrics.declarationMaps.gzipBytes,
    ],
  ];

  console.log("Luna package size report");
  for (const [label, rawBytes, gzipBytes] of rows) {
    const gzip = gzipBytes === null ? "" : `; gzip ${formatBytes(gzipBytes)}`;
    console.log(`- ${label}: ${formatBytes(rawBytes)}${gzip}`);
  }
}

async function verifyBudgets(metrics) {
  const budgetFile = JSON.parse(await readFile(budgetPath, "utf8"));
  const measured = flattenMetrics(metrics);
  const failures = [];

  for (const metric of Object.keys(measured)) {
    assert.equal(
      typeof budgetFile.budgets[metric],
      "number",
      `Missing size budget metric: ${metric}`,
    );
  }

  for (const [metric, maximumBytes] of Object.entries(budgetFile.budgets)) {
    assert.equal(
      typeof measured[metric],
      "number",
      `Unknown size budget metric: ${metric}`,
    );
    assert.equal(
      typeof maximumBytes,
      "number",
      `Budget for ${metric} must be a number`,
    );

    if (measured[metric] > maximumBytes) {
      failures.push(
        `${metric}: ${formatBytes(measured[metric])} exceeds ${formatBytes(maximumBytes)}`,
      );
    }
  }

  assert.equal(
    failures.length,
    0,
    `Package size budget exceeded:\n${failures.join("\n")}`,
  );
  console.log("Package size budgets passed");
}

const distStats = await stat(distDirectory);
assert(
  distStats.isDirectory(),
  "dist/ must exist before measuring package size",
);

const distFiles = await listFiles(distDirectory);
const javascriptFiles = distFiles.filter((file) => file.endsWith(".js"));
const declarationFiles = distFiles.filter((file) => file.endsWith(".d.ts"));
const declarationMapFiles = distFiles.filter((file) =>
  file.endsWith(".d.ts.map"),
);
const stylesPath = path.join(distDirectory, "styles.css");
const publicIndexPath = path.join(distDirectory, "index.js");
const archive = await createArchive();

try {
  const metrics = {
    archive: { bytes: archive.bytes },
    dist: { rawBytes: (await measureFiles(distFiles)).rawBytes },
    styles: await measureFiles([stylesPath]),
    publicIndex: await measureFiles([publicIndexPath]),
    javascript: await measureFiles(javascriptFiles),
    declarations: await measureFiles(declarationFiles),
    declarationMaps: await measureFiles(declarationMapFiles),
  };

  if (jsonOutput) {
    console.log(JSON.stringify(metrics, null, 2));
  } else {
    printReport(metrics);
  }

  if (checkBudgets) {
    await verifyBudgets(metrics);
  }
} finally {
  await removeTemporaryRoot(archive.temporaryRoot);
}
