import assert from "node:assert/strict";
import { copyFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourcePath = path.join(packageRoot, "src", "styles", "theme.css");
const outputPath = path.join(packageRoot, "dist", "theme.css");
const theme = await readFile(sourcePath, "utf8");

assert(
  theme.includes("@theme inline"),
  "The Tailwind authoring contract must contain an inline theme mapping",
);
assert(
  !theme.includes("@source"),
  "The published theme contract must not scan repository source paths",
);
assert(
  !theme.includes("--color-luna-blue-"),
  "Primitive palette utilities must remain private",
);

await copyFile(sourcePath, outputPath);
