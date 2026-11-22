import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const STABLE_SEMVER_FRAGMENT =
  "(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)";
const STABLE_SEMVER = new RegExp(`^${STABLE_SEMVER_FRAGMENT}$`);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class ReleaseMetadataError extends Error {
  constructor(issues) {
    super(
      `Release metadata validation failed:\n${issues
        .map((issue) => `- ${issue}`)
        .join("\n")}`,
    );
    this.name = "ReleaseMetadataError";
    this.issues = issues;
  }
}

function readJson(filePath, label, issues) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    issues.push(
      `${label} could not be read as JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {};
  }
}

function normalizeRepositoryUrl(repository) {
  const rawUrl =
    typeof repository === "string"
      ? repository
      : repository && typeof repository.url === "string"
        ? repository.url
        : "";

  return rawUrl
    .replace(/^git\+/, "")
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
}

function isRealIsoDate(value) {
  if (!ISO_DATE.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseChangelog(changelog) {
  const headingPattern = /^## \[([^\]]+)\](?: - ([^\n]+))?$/gm;
  const headings = [...changelog.matchAll(headingPattern)].map((match) => ({
    name: match[1],
    date: match[2],
    index: match.index,
    contentStart: match.index + match[0].length,
  }));

  const links = new Map();
  for (const match of changelog.matchAll(/^\[([^\]]+)\]:\s*(\S+)\s*$/gm)) {
    if (!links.has(match[1])) links.set(match[1], []);
    links.get(match[1]).push(match[2]);
  }

  return { headings, links };
}

function releaseSectionBody(changelog, headings, target) {
  const headingIndex = headings.indexOf(target);
  const nextHeading = headings[headingIndex + 1];
  const end = nextHeading ? nextHeading.index : changelog.length;

  return changelog
    .slice(target.contentStart, end)
    .replace(/^\[[^\]]+\]:.*$/gm, "");
}

export function validateReleaseMetadata({ rootDir = process.cwd(), tag } = {}) {
  const issues = [];
  const rootPackagePath = path.join(rootDir, "package.json");
  const uiPackagePath = path.join(rootDir, "packages/ui/package.json");
  const changelogPath = path.join(rootDir, "CHANGELOG.md");
  const rootPackage = readJson(rootPackagePath, "root package.json", issues);
  const uiPackage = readJson(uiPackagePath, "packages/ui/package.json", issues);

  let changelog = "";
  try {
    changelog = readFileSync(changelogPath, "utf8");
  } catch (error) {
    issues.push(
      `CHANGELOG.md could not be read: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const rootVersion = rootPackage.version;
  const version = uiPackage.version;

  if (typeof version !== "string" || !STABLE_SEMVER.test(version)) {
    issues.push(
      `packages/ui/package.json version must be a stable X.Y.Z version; received ${JSON.stringify(version)}`,
    );
  }

  if (rootVersion !== version) {
    issues.push(
      `root package version ${JSON.stringify(rootVersion)} does not match UI package version ${JSON.stringify(version)}`,
    );
  }

  const repositoryUrl = normalizeRepositoryUrl(uiPackage.repository);
  if (!repositoryUrl.startsWith("https://github.com/")) {
    issues.push(
      "packages/ui/package.json repository must resolve to an HTTPS GitHub repository URL",
    );
  }

  const { headings, links } = parseChangelog(changelog);
  const unreleasedHeadings = headings.filter(
    (heading) => heading.name === "Unreleased",
  );

  if (unreleasedHeadings.length !== 1) {
    issues.push(
      `CHANGELOG.md must contain exactly one ## [Unreleased] section; found ${unreleasedHeadings.length}`,
    );
  }

  const releaseHeadings = headings.filter(
    (heading) => heading.name === version,
  );
  if (releaseHeadings.length !== 1) {
    issues.push(
      `CHANGELOG.md must contain exactly one ## [${version}] release section; found ${releaseHeadings.length}`,
    );
  }

  const releaseHeading = releaseHeadings[0];
  if (releaseHeading) {
    if (!releaseHeading.date || !isRealIsoDate(releaseHeading.date)) {
      issues.push(
        `CHANGELOG.md section [${version}] must use a real ISO date in the form YYYY-MM-DD`,
      );
    }

    const sectionBody = releaseSectionBody(changelog, headings, releaseHeading);
    if (!/^\s*[-*]\s+\S/m.test(sectionBody)) {
      issues.push(
        `CHANGELOG.md section [${version}] must contain at least one reviewable list entry`,
      );
    }
  }

  const releaseLinks = links.get(String(version)) ?? [];
  if (releaseLinks.length !== 1) {
    issues.push(
      `CHANGELOG.md must contain exactly one [${version}] comparison link; found ${releaseLinks.length}`,
    );
  } else if (repositoryUrl) {
    const releaseLinkMatch = releaseLinks[0].match(
      new RegExp(
        `^${escapeRegExp(repositoryUrl)}/compare/v(${STABLE_SEMVER_FRAGMENT})\\.\\.\\.v${escapeRegExp(String(version))}$`,
      ),
    );
    if (!releaseLinkMatch || releaseLinkMatch[1] === version) {
      issues.push(
        `CHANGELOG.md [${version}] link must compare a prior stable tag to v${version} in ${repositoryUrl}`,
      );
    }
  }

  const unreleasedLinks = links.get("Unreleased") ?? [];
  const expectedUnreleasedLink = `${repositoryUrl}/compare/v${version}...HEAD`;
  if (unreleasedLinks.length !== 1) {
    issues.push(
      `CHANGELOG.md must contain exactly one [Unreleased] comparison link; found ${unreleasedLinks.length}`,
    );
  } else if (repositoryUrl && unreleasedLinks[0] !== expectedUnreleasedLink) {
    issues.push(
      `CHANGELOG.md [Unreleased] link must be ${expectedUnreleasedLink}`,
    );
  }

  if (tag !== undefined && tag !== `v${version}`) {
    issues.push(
      `release tag ${JSON.stringify(tag)} does not match package version v${version}`,
    );
  }

  if (issues.length > 0) throw new ReleaseMetadataError(issues);

  return {
    changelogDate: releaseHeading.date,
    repositoryUrl,
    tag: tag ?? null,
    version,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseArguments(argv) {
  const options = { rootDir: process.cwd(), tag: undefined, json: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") {
      continue;
    } else if (argument === "--root") {
      options.rootDir = path.resolve(argv[index + 1] ?? "");
      index += 1;
    } else if (argument === "--tag") {
      options.tag = argv[index + 1];
      index += 1;
    } else if (argument === "--json") {
      options.json = true;
    } else if (argument === "--help") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (options.tag === undefined && process.env.GITHUB_REF_TYPE === "tag") {
    options.tag = process.env.GITHUB_REF_NAME;
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/release-metadata.mjs [options]

Options:
  --root <path>  Repository root to validate (default: current directory)
  --tag <tag>    Require the tag to match v<package version>
  --json         Print the validated metadata as JSON
  --help         Show this help`);
}

function runCli() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const result = validateReleaseMetadata(options);
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(
        `Release metadata valid: @withalif/luna v${result.version} (${result.changelogDate})`,
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
