import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distDirectory = path.join(packageRoot, "dist");
const inspectOnly = process.argv.includes("--inspect-only");
const temporaryPrefix = path.join(os.tmpdir(), "luna-package-smoke-");
const resolvedTemporaryPrefix = path.join(
  await realpath(os.tmpdir()),
  "luna-package-smoke-",
);
const temporaryRoot = await mkdtemp(temporaryPrefix);

function run(command, args, cwd, { capture = false } = {}) {
  const renderedCommand = [command, ...args].join(" ");
  console.log(`> ${renderedCommand}`);

  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "1",
    },
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });
}

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

  return files;
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function validateDist() {
  const distStats = await stat(distDirectory);
  assert(distStats.isDirectory(), "dist/ must exist before package validation");

  const distFiles = await listFiles(distDirectory);
  assert(distFiles.length > 0, "dist/ must not be empty");

  const allowedSuffixes = [".js", ".js.map", ".d.ts", ".d.ts.map", ".css"];
  for (const file of distFiles) {
    assert(
      allowedSuffixes.some((suffix) => file.endsWith(suffix)),
      `Unexpected build artifact: ${path.relative(distDirectory, file)}`,
    );
  }

  const requiredFiles = [
    "index.js",
    "index.d.ts",
    "index.d.ts.map",
    "styles.css",
    "components/ui/button.js",
    "components/ui/button.d.ts",
  ];

  for (const requiredFile of requiredFiles) {
    await stat(path.join(distDirectory, requiredFile));
  }

  const sourceDirectory = path.join(packageRoot, "src");
  const sourceFiles = await listFiles(sourceDirectory);
  const publicClientFiles = [];

  for (const sourceFile of sourceFiles) {
    if (!sourceFile.endsWith(".ts") && !sourceFile.endsWith(".tsx")) continue;
    if (!sourceFile.includes(`${path.sep}components${path.sep}`)) continue;

    const source = await readFile(sourceFile, "utf8");
    if (!source.startsWith('"use client";')) continue;

    publicClientFiles.push(sourceFile);
    const relativeOutput = path
      .relative(sourceDirectory, sourceFile)
      .replace(/\.tsx?$/, ".js");
    const output = await readFile(
      path.join(distDirectory, relativeOutput),
      "utf8",
    );
    assert(
      output.startsWith('"use client";'),
      `Client boundary was not preserved in ${relativeOutput}`,
    );
  }

  assert(
    publicClientFiles.length > 0,
    "Expected at least one public React client module",
  );

  const stylesheet = await readFile(
    path.join(distDirectory, "styles.css"),
    "utf8",
  );
  assert(
    stylesheet.length > 10_000,
    "Compiled stylesheet is unexpectedly small",
  );
  assert(
    !stylesheet.includes('@import "tailwindcss"'),
    "Tailwind import must be compiled before packaging",
  );
}

async function validateArchive(tarballPath) {
  const archiveListing = run("tar", ["-tzf", tarballPath], packageRoot, {
    capture: true,
  });
  const archiveEntries = archiveListing
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((entry) => entry.replace(/^package\//, ""));

  const unexpectedEntries = archiveEntries.filter(
    (entry) =>
      entry !== "package.json" &&
      entry !== "README.md" &&
      !entry.startsWith("dist/"),
  );
  assert.deepEqual(
    unexpectedEntries,
    [],
    `Unexpected files in archive: ${unexpectedEntries.join(", ")}`,
  );

  const requiredEntries = [
    "package.json",
    "README.md",
    "dist/index.js",
    "dist/index.d.ts",
    "dist/index.d.ts.map",
    "dist/styles.css",
  ];
  for (const requiredEntry of requiredEntries) {
    assert(
      archiveEntries.includes(requiredEntry),
      `Archive is missing ${requiredEntry}`,
    );
  }

  assert(
    archiveEntries.some((entry) => entry.endsWith(".js.map")),
    "Archive must include JavaScript source maps",
  );
  assert(
    archiveEntries.some((entry) => entry.endsWith(".d.ts.map")),
    "Archive must include declaration maps",
  );

  const extractionDirectory = path.join(temporaryRoot, "extracted");
  await mkdir(extractionDirectory);
  run("tar", ["-xzf", tarballPath, "-C", extractionDirectory], packageRoot);

  const packedPackageJsonPath = path.join(
    extractionDirectory,
    "package",
    "package.json",
  );
  const packedPackageJson = JSON.parse(
    await readFile(packedPackageJsonPath, "utf8"),
  );
  const serializedExports = JSON.stringify(packedPackageJson.exports);
  const serializedRuntimeDependencies = JSON.stringify({
    dependencies: packedPackageJson.dependencies,
    optionalDependencies: packedPackageJson.optionalDependencies,
    peerDependencies: packedPackageJson.peerDependencies,
  });

  assert(
    !serializedExports.includes("src/"),
    "Exports must not reference src/",
  );
  assert(
    !serializedRuntimeDependencies.includes("workspace:"),
    "Packed runtime dependencies must not use workspace: ranges",
  );
  assert.equal(packedPackageJson.exports["."].types, "./dist/index.d.ts");
  assert.equal(packedPackageJson.exports["."].import, "./dist/index.js");
  assert.equal(packedPackageJson.exports["./styles.css"], "./dist/styles.css");
  assert.deepEqual(packedPackageJson.sideEffects, ["./dist/styles.css"]);
  assert.equal(packedPackageJson.dependencies?.react, undefined);
  assert.equal(packedPackageJson.dependencies?.["react-dom"], undefined);
  assert.equal(packedPackageJson.peerDependencies.react, "19.2.8");
  assert.equal(packedPackageJson.peerDependencies["react-dom"], "19.2.8");

  run(
    "pnpm",
    [
      "exec",
      "attw",
      tarballPath,
      "--profile",
      "esm-only",
      "--entrypoints",
      ".",
    ],
    packageRoot,
  );
}

async function createConsumer(tarballPath) {
  const consumerDirectory = path.join(temporaryRoot, "consumer");
  const sourceDirectory = path.join(consumerDirectory, "src");
  await mkdir(sourceDirectory, { recursive: true });

  await writeJson(path.join(consumerDirectory, "package.json"), {
    name: "luna-package-smoke-consumer",
    version: "0.0.0",
    private: true,
    type: "module",
    dependencies: {
      "@withalif/luna": `file:${tarballPath}`,
      react: "19.2.8",
      "react-dom": "19.2.8",
    },
    devDependencies: {
      "@types/react": "19.2.18",
      "@types/react-dom": "19.2.5",
      typescript: "7.0.2",
      vite: "8.3.0",
    },
  });

  await writeJson(path.join(consumerDirectory, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      types: ["vite/client"],
    },
    include: ["src"],
  });

  await writeFile(
    path.join(consumerDirectory, "index.html"),
    '<div id="root"></div>\n<script type="module" src="/src/client.tsx"></script>\n',
    "utf8",
  );

  await writeFile(
    path.join(consumerDirectory, "vite.config.mjs"),
    'export default { logLevel: "error" };\n',
    "utf8",
  );

  await writeFile(
    path.join(sourceDirectory, "client.tsx"),
    `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Button, Card, CardContent, CardTitle } from "@withalif/luna";
import "@withalif/luna/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing client root");

createRoot(root).render(
  <StrictMode>
    <Card>
      <CardTitle>Luna archive consumer</CardTitle>
      <CardContent>
        <Button>Client action</Button>
      </CardContent>
    </Card>
  </StrictMode>,
);
`,
    "utf8",
  );

  await writeFile(
    path.join(sourceDirectory, "server.tsx"),
    `import { renderToStaticMarkup } from "react-dom/server";
import { Card, CardContent, CardTitle } from "@withalif/luna";

const html = renderToStaticMarkup(
  <Card>
    <CardTitle>Luna SSR consumer</CardTitle>
    <CardContent>Rendered from the packed archive.</CardContent>
  </Card>,
);

if (!html.includes("Luna SSR consumer")) {
  throw new Error("Server-rendered Luna markup is missing");
}

console.log("Server-rendered consumer passed");
`,
    "utf8",
  );

  await writeFile(
    path.join(consumerDirectory, "verify-package.mjs"),
    `import assert from "node:assert/strict";
import { realpathSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Button, Card } from "@withalif/luna";

const require = createRequire(import.meta.url);
assert.equal(typeof Button, "function");
assert.equal(typeof Card, "function");

const lunaPackageJson = require.resolve("@withalif/luna/package.json");
const lunaRequire = createRequire(lunaPackageJson);
const consumerReact = realpathSync(require.resolve("react/package.json"));
const lunaReact = realpathSync(lunaRequire.resolve("react/package.json"));
assert.equal(lunaReact, consumerReact, "Luna resolved a duplicate React instance");

const stylesheetPath = require.resolve("@withalif/luna/styles.css");
assert(readFileSync(stylesheetPath, "utf8").length > 10_000);

let privateImportBlocked = false;
try {
  await import("@withalif/luna/src/index.ts");
} catch (error) {
  privateImportBlocked = error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED";
}
assert(privateImportBlocked, "Private src/ imports must be blocked by exports");

console.log("Public exports, CSS, React peer, and private imports passed");
`,
    "utf8",
  );

  return consumerDirectory;
}

try {
  await validateDist();

  const archiveDirectory = path.join(temporaryRoot, "archive");
  await mkdir(archiveDirectory);
  run("pnpm", ["pack", "--pack-destination", archiveDirectory], packageRoot, {
    capture: true,
  });

  const tarballs = (await readdir(archiveDirectory)).filter((file) =>
    file.endsWith(".tgz"),
  );
  assert.equal(tarballs.length, 1, "Expected exactly one package archive");
  const tarballPath = path.join(archiveDirectory, tarballs[0]);

  await validateArchive(tarballPath);

  if (!inspectOnly) {
    const consumerDirectory = await createConsumer(tarballPath);
    run(
      "pnpm",
      ["install", "--prefer-offline", "--frozen-lockfile=false"],
      consumerDirectory,
    );
    run("pnpm", ["exec", "tsc", "-p", "tsconfig.json"], consumerDirectory);
    run("pnpm", ["exec", "vite", "build"], consumerDirectory);
    run(
      "pnpm",
      [
        "exec",
        "vite",
        "build",
        "--ssr",
        "src/server.tsx",
        "--outDir",
        "dist-server",
      ],
      consumerDirectory,
    );
    run("node", ["dist-server/server.js"], consumerDirectory);
    run("node", ["verify-package.mjs"], consumerDirectory);
  }

  console.log(
    inspectOnly
      ? "Package archive inspection passed"
      : "Isolated package consumer smoke test passed",
  );
} finally {
  const resolvedTemporaryRoot = await realpath(temporaryRoot).catch(
    () => temporaryRoot,
  );
  assert(
    resolvedTemporaryRoot.startsWith(resolvedTemporaryPrefix),
    `Refusing to remove unexpected path: ${resolvedTemporaryRoot}`,
  );
  await rm(resolvedTemporaryRoot, { recursive: true, force: true });
}
