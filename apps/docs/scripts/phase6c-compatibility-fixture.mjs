import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import { chromium, firefox, webkit } from "playwright";

// Mirrors apps/docs/phase6c-engines.ts. CI runs WebKit on a macOS runner and
// Chromium/Firefox on Linux, so each job exercises only its own engines.
const browserEngines = { chromium, firefox, webkit };
const engineLabels = {
  chromium: "Chromium",
  firefox: "Firefox",
  webkit: "WebKit",
};
const selectedEngines = process.env.PHASE6C_ENGINES?.trim()
  ? [...new Set(process.env.PHASE6C_ENGINES.split(",").map((e) => e.trim()))]
  : Object.keys(browserEngines);
for (const engine of selectedEngines) {
  assert(
    engine in browserEngines,
    `Unsupported PHASE6C_ENGINES entry "${engine}"`,
  );
}
const includesChromium = selectedEngines.includes("chromium");

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const packageRoot = path.resolve(docsRoot, "../../packages/ui");
const temporaryPrefix = path.join(os.tmpdir(), "luna-phase6c-fixture-");
const resolvedTemporaryPrefix = path.join(
  await realpath(os.tmpdir()),
  "luna-phase6c-fixture-",
);
const temporaryRoot = await mkdtemp(temporaryPrefix);

function run(command, args, cwd) {
  console.log(`> ${[command, ...args].join(" ")}`);
  execFileSync(command, args, {
    cwd,
    env: {
      ...process.env,
      CI: "1",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "inherit",
  });
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

async function measureFiles(directory, suffix) {
  const files = (await listFiles(directory)).filter((file) =>
    file.endsWith(suffix),
  );
  let rawBytes = 0;
  let gzipBytes = 0;

  for (const file of files) {
    const contents = await readFile(file);
    rawBytes += contents.byteLength;
    gzipBytes += gzipSync(contents, { level: 9 }).byteLength;
  }

  return { rawBytes, gzipBytes };
}

async function assertFixtureSizeBudgets(measurements) {
  const budgetPath = path.join(docsRoot, "phase6c-fixture-size-budget.json");
  const budget = JSON.parse(await readFile(budgetPath, "utf8"));
  assert.equal(budget.version, 1, "Unsupported fixture size budget version");

  for (const [group, values] of Object.entries(measurements)) {
    assert(budget.budgets[group], `Missing fixture size budget for ${group}`);

    for (const [metric, actual] of Object.entries(values)) {
      const maximum = budget.budgets[group][metric];
      assert.equal(
        typeof maximum,
        "number",
        `Missing fixture size budget for ${group}.${metric}`,
      );
      assert(
        actual <= maximum,
        `${group}.${metric} is ${actual} B; budget is ${maximum} B`,
      );
    }
  }
}

async function availablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object");
  const { port } = address;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function waitForServer(url, processLogs) {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // The production server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Next.js fixture did not start:\n${processLogs.join("")}`);
}

async function stopServer(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");

  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);

  if (child.exitCode === null) child.kill("SIGKILL");
}

async function createFixture(tarballPath) {
  const fixtureRoot = path.join(temporaryRoot, "next-consumer");
  const appRoot = path.join(fixtureRoot, "app");
  await mkdir(appRoot, { recursive: true });

  await writeJson(path.join(fixtureRoot, "package.json"), {
    name: "luna-phase6c-next-consumer",
    version: "0.0.0",
    private: true,
    scripts: {
      build: "next build",
      start: "next start",
    },
    dependencies: {
      "@withalif/luna": `file:${tarballPath}`,
      next: "16.3.4",
      react: "19.2.8",
      "react-dom": "19.2.8",
    },
    devDependencies: {
      "@types/node": "26.4.1",
      "@types/react": "19.2.18",
      "@types/react-dom": "19.2.5",
      typescript: "7.0.2",
      vite: "8.3.0",
    },
  });

  await writeJson(path.join(fixtureRoot, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2024",
      lib: ["DOM", "DOM.Iterable", "ES2024"],
      allowJs: false,
      skipLibCheck: false,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "ESNext",
      moduleResolution: "Bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "react-jsx",
      incremental: true,
      plugins: [{ name: "next" }],
    },
    include: ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"],
  });

  await writeFile(
    path.join(fixtureRoot, "next.config.mjs"),
    `const nextConfig = { reactStrictMode: true };
export default nextConfig;
`,
    "utf8",
  );

  await writeFile(
    path.join(appRoot, "layout.tsx"),
    `import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@withalif/luna/styles.css";

export const metadata: Metadata = { title: "Luna Phase 6C fixture" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
`,
    "utf8",
  );

  await writeFile(
    path.join(appRoot, "page.tsx"),
    `import { Card, CardContent, CardTitle } from "@withalif/luna";

import { CompatibilityClient } from "./compatibility-client";

export default function Page() {
  return (
    <main style={{ margin: "2rem auto", maxWidth: "32rem", padding: "1rem" }}>
      <h1>Packed archive compatibility</h1>
      <Card>
        <CardTitle>Server-rendered Luna card</CardTitle>
        <CardContent>
          <CompatibilityClient />
        </CardContent>
      </Card>
    </main>
  );
}
`,
    "utf8",
  );

  await writeFile(
    path.join(appRoot, "compatibility-client.tsx"),
    `"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "@withalif/luna";

export function CompatibilityClient() {
  const [value, setValue] = useState("Initial value");

  return (
    <div>
      <Label htmlFor="phase6c-name">Review name</Label>
      <Input
        id="phase6c-name"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <p aria-live="polite" data-testid="controlled-value">
        {value}
      </p>
      <Dialog>
        <DialogTrigger render={<Button />}>Open compatibility dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Hydrated portal</DialogTitle>
          <DialogDescription>
            This dialog is rendered through Luna after hydration.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
`,
    "utf8",
  );

  const viteRoot = path.join(fixtureRoot, "vite");
  const viteSourceRoot = path.join(viteRoot, "src");
  await mkdir(viteSourceRoot, { recursive: true });
  await writeFile(
    path.join(viteRoot, "index.html"),
    '<div id="root"></div>\n<script type="module" src="/src/client.tsx"></script>\n',
    "utf8",
  );
  await writeFile(
    path.join(viteRoot, "vite.config.mjs"),
    'export default { logLevel: "error" };\n',
    "utf8",
  );
  await writeFile(
    path.join(viteSourceRoot, "client.tsx"),
    `import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Card, CardContent, CardTitle } from "@withalif/luna";
import "@withalif/luna/styles.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Card>
      <CardTitle>Vite packed archive consumer</CardTitle>
      <CardContent>
        <Button onClick={() => setCount((value) => value + 1)}>
          Vite interactions {count}
        </Button>
      </CardContent>
    </Card>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing Vite root");
createRoot(root).render(<App />);
`,
    "utf8",
  );

  return fixtureRoot;
}

async function exerciseEngine(name, browserType, url) {
  const browser = await browserType.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "Packed archive compatibility" })
      .waitFor();

    assert(
      (await page.locator('link[rel="stylesheet"]').count()) > 0,
      `${name}: Next.js did not load the packaged stylesheet`,
    );

    const input = page.getByLabel("Review name");
    await input.fill("Hydrated value");
    assert.equal(
      await page.getByTestId("controlled-value").textContent(),
      "Hydrated value",
      `${name}: controlled input did not update after hydration`,
    );

    const trigger = page.getByRole("button", {
      name: "Open compatibility dialog",
    });
    const triggerStyle = await trigger.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        minHeight: style.height,
      };
    });
    assert.notEqual(
      triggerStyle.backgroundColor,
      "rgba(0, 0, 0, 0)",
      `${name}: Luna button styles were not applied`,
    );

    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Hydrated portal" });
    await dialog.waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert(
      await trigger.evaluate((element) => element === document.activeElement),
      `${name}: dialog trigger did not regain focus`,
    );

    assert.deepEqual(pageErrors, [], `${name}: browser page errors`);
    assert.deepEqual(consoleErrors, [], `${name}: browser console errors`);
    console.log(`${name}: hydration and interaction passed`);
  } finally {
    await browser.close();
  }
}

async function exerciseMediaPreferences(url) {
  const browser = await chromium.launch();

  try {
    const reducedContext = await browser.newContext({
      reducedMotion: "reduce",
    });
    const reducedPage = await reducedContext.newPage();
    await reducedPage.goto(url, { waitUntil: "networkidle" });
    await reducedPage
      .getByRole("button", { name: "Open compatibility dialog" })
      .click();
    const reducedDialog = reducedPage.getByRole("dialog", {
      name: "Hydrated portal",
    });
    await reducedDialog.waitFor({ state: "visible" });
    const reducedMovement = await reducedDialog.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        translateX: style.getPropertyValue("--tw-enter-translate-x").trim(),
        translateY: style.getPropertyValue("--tw-enter-translate-y").trim(),
        scale: style.getPropertyValue("--tw-enter-scale").trim(),
      };
    });
    assert.deepEqual(reducedMovement, {
      translateX: "0",
      translateY: "0",
      scale: "1",
    });
    await reducedPage.keyboard.press("Escape");
    await reducedDialog.waitFor({ state: "hidden" });
    await reducedContext.close();

    const forcedContext = await browser.newContext({ forcedColors: "active" });
    const forcedPage = await forcedContext.newPage();
    await forcedPage.goto(url, { waitUntil: "networkidle" });
    const trigger = forcedPage.getByRole("button", {
      name: "Open compatibility dialog",
    });
    await trigger.focus();
    assert(
      await forcedPage.evaluate(
        () => matchMedia("(forced-colors: active)").matches,
      ),
      "Forced-colors emulation was not active",
    );
    const focusIndicator = await trigger.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    assert.notEqual(
      focusIndicator.outlineStyle,
      "none",
      "Forced-colors focus indicator is not visible",
    );
    assert.notEqual(focusIndicator.outlineWidth, "0px");
    await forcedContext.close();

    console.log("Reduced-motion and forced-colors preferences passed");
  } finally {
    await browser.close();
  }
}

async function exerciseViteClient(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    const button = page.getByRole("button", { name: "Vite interactions 0" });
    await button.waitFor();
    assert.notEqual(
      await button.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
      "rgba(0, 0, 0, 0)",
      "Vite consumer did not load Luna styles",
    );
    await button.click();
    await page.getByRole("button", { name: "Vite interactions 1" }).waitFor();
    assert.deepEqual(errors, []);
    console.log("Vite browser mount and interaction passed");
  } finally {
    await browser.close();
  }
}

let serverProcess;

try {
  const archiveDirectory = path.join(temporaryRoot, "archive");
  await mkdir(archiveDirectory);
  run("pnpm", ["pack", "--pack-destination", archiveDirectory], packageRoot);

  const tarballs = (await readdir(archiveDirectory)).filter((file) =>
    file.endsWith(".tgz"),
  );
  assert.equal(tarballs.length, 1, "Expected exactly one Luna package archive");
  const fixtureRoot = await createFixture(
    path.join(archiveDirectory, tarballs[0]),
  );

  run(
    "pnpm",
    ["install", "--prefer-offline", "--frozen-lockfile=false"],
    fixtureRoot,
  );
  run("pnpm", ["exec", "vite", "build", "vite"], fixtureRoot);
  run("pnpm", ["run", "build"], fixtureRoot);

  const fixtureSizes = {
    viteJavaScript: await measureFiles(
      path.join(fixtureRoot, "vite/dist"),
      ".js",
    ),
    viteStyles: await measureFiles(path.join(fixtureRoot, "vite/dist"), ".css"),
    nextClientJavaScript: await measureFiles(
      path.join(fixtureRoot, ".next/static/chunks"),
      ".js",
    ),
    nextServerJavaScript: await measureFiles(
      path.join(fixtureRoot, ".next/server"),
      ".js",
    ),
  };
  await assertFixtureSizeBudgets(fixtureSizes);
  console.log(`Fixture sizes: ${JSON.stringify(fixtureSizes)}`);

  const port = await availablePort();
  const url = `http://127.0.0.1:${port}`;
  const processLogs = [];
  serverProcess = spawn(
    "pnpm",
    ["run", "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: fixtureRoot,
      env: {
        ...process.env,
        CI: "1",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  serverProcess.stdout.on("data", (chunk) =>
    processLogs.push(chunk.toString()),
  );
  serverProcess.stderr.on("data", (chunk) =>
    processLogs.push(chunk.toString()),
  );

  const response = await waitForServer(url, processLogs);
  const serverMarkup = await response.text();
  assert(serverMarkup.includes("Packed archive compatibility"));
  assert(serverMarkup.includes("Server-rendered Luna card"));
  assert(serverMarkup.includes("Initial value"));

  for (const engine of selectedEngines) {
    await exerciseEngine(engineLabels[engine], browserEngines[engine], url);
  }

  // Preference emulation and the Vite client mount are Chromium checks.
  if (includesChromium) await exerciseMediaPreferences(url);

  await stopServer(serverProcess);
  serverProcess = undefined;

  const vitePort = await availablePort();
  const viteUrl = `http://127.0.0.1:${vitePort}`;
  const viteLogs = [];
  serverProcess = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "preview",
      "vite",
      "--host",
      "127.0.0.1",
      "--port",
      String(vitePort),
    ],
    {
      cwd: fixtureRoot,
      env: { ...process.env, CI: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  serverProcess.stdout.on("data", (chunk) => viteLogs.push(chunk.toString()));
  serverProcess.stderr.on("data", (chunk) => viteLogs.push(chunk.toString()));
  await waitForServer(viteUrl, viteLogs);
  if (includesChromium) await exerciseViteClient(viteUrl);

  console.log("Phase 6C packed Next.js SSR/hydration fixture passed");
} finally {
  if (serverProcess) await stopServer(serverProcess);

  const resolvedTemporaryRoot = await realpath(temporaryRoot).catch(
    () => temporaryRoot,
  );
  assert(
    resolvedTemporaryRoot.startsWith(resolvedTemporaryPrefix),
    `Refusing to remove unexpected path: ${resolvedTemporaryRoot}`,
  );
  await rm(resolvedTemporaryRoot, { recursive: true, force: true });
}
