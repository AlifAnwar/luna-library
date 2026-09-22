import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { transform } from "@svgr/core";
import jsx from "@svgr/plugin-jsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonUrl = import.meta
  .resolve("@material-symbols/svg-400/package.json");
const svgRoot = path.join(fileURLToPath(packageJsonUrl), "../rounded");
const outDir = path.join(__dirname, "../src/icons");

// componentName -> [material symbol file name, filled?]
const icons = {
  AddIcon: ["add", false],
  ArrowRightIcon: ["arrow_forward", false],
  CalendarIcon: ["calendar_month", false],
  WarningIcon: ["warning", true],
  ChevronRightIcon: ["chevron_right", false],
  CloseIcon: ["close", false],
  CancelIcon: ["cancel", true],
  CheckIcon: ["check", false],
  CheckCircleIcon: ["check_circle", true],
  ChevronDownIcon: ["keyboard_arrow_down", false],
  ChevronLeftIcon: ["chevron_left", false],
  ChevronUpIcon: ["keyboard_arrow_up", false],
  DeleteIcon: ["delete", false],
  EditIcon: ["edit", false],
  EyeIcon: ["visibility", false],
  EyeOffIcon: ["visibility_off", false],
  FileIcon: ["description", false],
  InfoIcon: ["info", true],
  LoadingIcon: ["progress_activity", false],
  MinusIcon: ["remove", false],
  MoreHorizontalIcon: ["more_horiz", false],
  SearchIcon: ["search", false],
  SettingsIcon: ["settings", false],
  UploadIcon: ["upload_file", false],
};

async function main() {
  await mkdir(outDir, { recursive: true });

  const exportLines = [];

  for (const [componentName, [fileName, filled]] of Object.entries(icons)) {
    const svgPath = path.join(
      svgRoot,
      `${fileName}${filled ? "-fill" : ""}.svg`,
    );
    const svgCode = await readFile(svgPath, "utf-8");

    const componentCode = await transform(
      svgCode,
      {
        plugins: [jsx],
        typescript: true,
        icon: true,
        svgProps: { fill: "currentColor" },
      },
      { componentName },
    );

    await writeFile(
      path.join(outDir, `${componentName}.tsx`),
      componentCode,
      "utf-8",
    );

    exportLines.push(
      `export { default as ${componentName} } from "./${componentName}";`,
    );
  }

  const indexContent = exportLines.sort().join("\n") + "\n";
  await writeFile(path.join(outDir, "index.ts"), indexContent, "utf-8");

  console.log(`Generated ${Object.keys(icons).length} icons in ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
