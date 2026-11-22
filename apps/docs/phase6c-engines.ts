const supportedEngines = ["chromium", "firefox", "webkit"] as const;

type Phase6cEngine = (typeof supportedEngines)[number];

/**
 * Resolves the browser engines for the Phase 6C suites. Every engine runs by
 * default; CI narrows the list with `PHASE6C_ENGINES` so WebKit can run on a
 * macOS runner (Apple's WebKit port) instead of the Linux GTK/WPE port.
 */
function resolvePhase6cEngines(
  value = process.env.PHASE6C_ENGINES,
): Phase6cEngine[] {
  if (!value?.trim()) return [...supportedEngines];

  const engines = value.split(",").map((engine) => engine.trim());
  for (const engine of engines) {
    if (!supportedEngines.includes(engine as Phase6cEngine)) {
      throw new Error(
        `Unsupported PHASE6C_ENGINES entry "${engine}". Use ${supportedEngines.join(", ")}.`,
      );
    }
  }
  return [...new Set(engines as Phase6cEngine[])];
}

export { resolvePhase6cEngines, type Phase6cEngine };
