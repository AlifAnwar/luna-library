import "./preview.css";
import * as React from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { DirectionProvider } from "@withalif/luna";

import {
  applyDocumentPreferences,
  resolveDirection,
  resolveTheme,
} from "./theme-direction";

function ThemeDirectionDecorator(
  Story: React.ComponentType,
  context: { globals: Record<string, unknown> },
) {
  const theme = resolveTheme(context.globals.theme);
  const direction = resolveDirection(context.globals.direction);

  React.useLayoutEffect(
    () =>
      applyDocumentPreferences(document.documentElement, {
        theme,
        direction,
      }),
    [direction, theme],
  );

  return (
    <DirectionProvider direction={direction}>
      <Story />
    </DirectionProvider>
  );
}

const preview: Preview = {
  initialGlobals: {
    theme: "light",
    direction: "ltr",
  },
  globalTypes: {
    theme: {
      description: "Luna color theme",
      toolbar: {
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
    direction: {
      description: "Document reading direction",
      toolbar: {
        icon: "globe",
        dynamicTitle: true,
        items: [
          { value: "ltr", title: "Left to right" },
          { value: "rtl", title: "Right to left" },
        ],
      },
    },
  },
  decorators: [ThemeDirectionDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "error",
    },
  },
};

export default preview;
