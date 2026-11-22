"use client";

import * as React from "react";
import { DirectionProvider as BaseDirectionProvider } from "@base-ui/react/direction-provider";

type Direction = "ltr" | "rtl";

type DirectionProviderProps = {
  children?: React.ReactNode;
  direction?: Direction;
};

/**
 * Provides the reading direction used by Luna's Base UI-backed interactions.
 * Consumers must also set the same value on the document `dir` attribute so
 * native layout, CSS logical properties, and portaled content stay in sync.
 */
function DirectionProvider({
  children,
  direction = "ltr",
}: DirectionProviderProps) {
  return (
    <BaseDirectionProvider direction={direction}>
      {children}
    </BaseDirectionProvider>
  );
}

export { DirectionProvider, type Direction, type DirectionProviderProps };
