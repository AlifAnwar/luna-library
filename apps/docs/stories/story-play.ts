/**
 * Storybook runs `play` functions whenever a story is opened. Keep the catalog
 * stable for people browsing it while preserving interaction coverage in the
 * Playwright-backed Storybook test runner.
 */
export function shouldRunStoryPlay(): boolean {
  return typeof navigator !== "undefined" && navigator.webdriver;
}
