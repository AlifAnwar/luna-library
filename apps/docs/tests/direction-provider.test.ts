import { describe, expect, it } from "vitest";

import {
  DirectionProvider,
  type Direction,
  type DirectionProviderProps,
} from "@withalif/luna";

const rtlDirection = "rtl" satisfies Direction;
const rtlProps = {
  direction: rtlDirection,
} satisfies DirectionProviderProps;

describe("DirectionProvider", () => {
  it("delegates the selected direction to the underlying provider", () => {
    const element = DirectionProvider({
      ...rtlProps,
      children: "RTL content",
    });

    expect(element.props.direction).toBe("rtl");
    expect(element.props.children).toBe("RTL content");
  });

  it("keeps ltr as the backward-compatible default", () => {
    const element = DirectionProvider({ children: "LTR content" });

    expect(element.props.direction).toBe("ltr");
  });
});
