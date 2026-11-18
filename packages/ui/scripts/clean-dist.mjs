import { rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distDirectory = path.join(packageRoot, "dist");

if (
  path.dirname(distDirectory) !== packageRoot ||
  path.basename(distDirectory) !== "dist"
) {
  throw new Error(`Refusing to clean unexpected path: ${distDirectory}`);
}

await rm(distDirectory, { recursive: true, force: true });
console.log(`Removed ${path.relative(process.cwd(), distDirectory) || "dist"}`);
