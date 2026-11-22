import type { Direction } from "@withalif/luna";

type Theme = "light" | "dark";

type DocumentPreferences = {
  direction: Direction;
  theme: Theme;
};

type DocumentPreferencesRoot = Pick<
  HTMLElement,
  "getAttribute" | "removeAttribute" | "setAttribute"
>;

function resolveTheme(value: unknown): Theme {
  return value === "dark" ? "dark" : "light";
}

function resolveDirection(value: unknown): Direction {
  return value === "rtl" ? "rtl" : "ltr";
}

/**
 * Applies Storybook's selected appearance to the document root and returns a
 * cleanup that restores the exact attributes that existed beforehand.
 */
function applyDocumentPreferences(
  root: DocumentPreferencesRoot,
  { direction, theme }: DocumentPreferences,
) {
  const previousTheme = root.getAttribute("data-theme");
  const previousDirection = root.getAttribute("dir");

  root.setAttribute("data-theme", theme);
  root.setAttribute("dir", direction);

  return () => {
    if (previousTheme === null) {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", previousTheme);
    }

    if (previousDirection === null) {
      root.removeAttribute("dir");
    } else {
      root.setAttribute("dir", previousDirection);
    }
  };
}

export {
  applyDocumentPreferences,
  resolveDirection,
  resolveTheme,
  type DocumentPreferences,
  type Theme,
};
