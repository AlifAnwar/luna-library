import type { CnFunction } from "cn";
import { createCn } from "cn/config";

/**
 * Luna's named type sizes, as declared under `--text-*` in
 * `src/styles/globals.css`. Keep the two lists in step: a size missing here is
 * silently dropped wherever it meets a text color.
 *
 * Class merging works by class *group*, and `text-*` covers both font size and
 * text color. Tailwind's own scale (`text-sm`, `text-lg`, …) is known to the
 * merge engine, but a project's custom sizes are not, so `text-body` is taken
 * for a color. Two colors conflict, so the later one wins and the earlier is
 * discarded — which is how `text-primary-foreground` disappeared from small
 * buttons, leaving their label at the inherited foreground color and well
 * under the WCAG AA contrast floor.
 *
 * Registering the sizes under the `text` theme namespace puts each class in
 * the group it belongs to, so a size and a color can coexist while size still
 * overrides size and color still overrides color.
 */
const textSizes = [
  "caption",
  "label",
  "body-sm",
  "body",
  "body-lg",
  "card-title",
  "section",
  "heading-sm",
  "heading",
  "page-title",
  "display",
];

/**
 * Joins class names and resolves Tailwind conflicts, Luna's type scale
 * included. Every Luna component composes its classes through this, and so
 * should anything built on top of them.
 */
const cn: CnFunction = createCn({
  extend: {
    theme: {
      text: textSizes,
    },
  },
});

export { cn };
