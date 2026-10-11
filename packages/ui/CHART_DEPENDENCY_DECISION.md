# Phase 4B Chart Dependency Decision

Status: accepted in Phase 4B; adoption gate passed in Phase 4C
Date: 2026-09-24

## Decision

Phase 4B will not install a chart rendering dependency.

The foundation components in this phase are renderer-agnostic presentation and accessibility primitives: container layout, captioning, legend, tooltip content, loading, and empty states. Luna will own these public contracts so a rendering engine does not leak into consumer APIs.

Recharts is the preferred engine candidate for Phase 4C. It must still pass an installation-time bundle comparison and a rendered accessibility review before adoption. Phase 4C must add only one chart engine.

## Audit

The workspace dependency manifests and source tree were checked before implementation.

- No charting package is installed in the root, docs, or UI package manifests.
- No chart renderer or chart-specific source implementation exists.
- Luna already exposes the semantic `--chart-1` through `--chart-5` color tokens.
- React 19.2.8 is the current runtime baseline.

## Options considered

### Recharts 3

- React-first, composable primitives fit Luna's planned line, bar, area, pie, and donut scope.
- The current package declares React 19 support.
- Recharts 3 enables its accessibility layer by default and documents keyboard navigation and tooltip support.
- Responsive charts can follow their parent dimensions without Luna exposing Recharts-specific props.

This is the preferred Phase 4C candidate because it offers the closest match to the required scope with less renderer construction than a low-level toolkit.

### visx

- Modular, unopinionated React visualization primitives.
- Strong control over markup and visual behavior.
- Requires Luna to assemble substantially more chart behavior, interaction, responsiveness, and accessibility itself.

This remains the fallback if Phase 4C reveals that Recharts cannot meet Luna's API or accessibility requirements.

### Chart.js

- Mature and broad chart coverage.
- Its primary renderer is canvas. Chart.js documents that canvas content is not accessible by itself and requires ARIA labeling or fallback content.
- The imperative canvas model is a weaker fit for Luna's React composition and semantic markup goals.

### Apache ECharts

- Broad feature coverage with both canvas and SVG renderers.
- Accessibility support must be explicitly enabled and configured.
- Its breadth is well beyond the deliberately small Phase 4 chart scope.

## Phase 4C adoption gate

Before Recharts is installed, Phase 4C must:

1. Record the exact package version and lockfile change.
2. Measure the production bundle delta using only the required modules.
3. Verify React 19 compatibility in Luna's build and Storybook.
4. Verify keyboard access, chart title and description, tooltip output, text alternatives, reduced motion, and non-color series identification.
5. Keep renderer-specific types and props out of Luna's public API.

## Phase 4C adoption result

Date verified: 2026-09-26

Recharts `3.10.1` is adopted as Luna's only chart engine. `react-is`
`19.2.8` is installed alongside it to match Luna's React `19.2.8`
runtime exactly, as required by Recharts' peer dependency guidance.

The public API remains renderer-agnostic. Consumers receive Luna-owned
`LineChart`, `BarChart`, `AreaChart`, `CartesianChartDatum`, and
`CartesianChartSeries` contracts; no Recharts props or types are re-exported.

### Compatibility and accessibility verification

- Recharts `3.10.1` declares React and React DOM `19.x` support.
- Luna's TypeScript checks pass against React `19.2.8` and TypeScript `7.0.2`.
- The Storybook browser suite passes with the accessibility layer enabled.
- The rendered SVG has a visible `2px` focus indicator, an accessible title and
  description, and keyboard navigation that exposes the active tooltip.
- Line and area series use distinct dash patterns; bar series use distinct fill
  patterns. Every series also retains a visible text label.
- Chart animation is disabled for the initial release, so reduced-motion users
  receive the same static presentation.

### Production bundle comparison

Both measurements use Storybook's production Vite build from the same commit
base and sum all emitted JavaScript assets.

| Build                               | Modules |  Raw JavaScript | Gzip JavaScript |
| ----------------------------------- | ------: | --------------: | --------------: |
| Phase 4B baseline                   |   1,833 | 4,084,715 bytes | 1,185,551 bytes |
| Phase 4C with Line/Bar/Area stories |   2,405 | 4,520,007 bytes | 1,309,611 bytes |
| Delta                               |    +572 |  +435,292 bytes |  +124,060 bytes |

The shared source chunk increased by approximately `419.24 kB` minified and
`120.32 kB` gzip. The remaining delta is primarily the three new Storybook
story chunks. This is accepted for Phase 4C because a single engine covers all
three Cartesian chart targets and is tree-shakeable (`sideEffects: false`).

## Phase 4D distribution charts

Date verified: 2026-09-26

No dependency is added. `PieChart` and `DonutChart` render through the Recharts
`PieChart`, `Pie`, and `Sector` modules from the already adopted `3.10.1`
package, behind Luna-owned `DistributionChartDatum`, `PieChartProps`, and
`DonutChartProps` contracts.

### Production bundle comparison

Date measured: 2026-09-28

Same method as Phase 4C: Storybook's production Vite build, summing every
emitted JavaScript asset under `assets/`, with gzip at level 9. The baseline is
the Phase 4C merge commit (`ce34b36`).

| Build                                 | Modules |  Raw JavaScript | Gzip JavaScript |
| ------------------------------------- | ------: | --------------: | --------------: |
| Phase 4C baseline                     |   2,405 | 4,543,470 bytes | 1,309,362 bytes |
| Phase 4D with Pie/Donut/Gauge stories |   2,410 | 4,624,823 bytes | 1,329,587 bytes |
| Delta                                 |      +5 |   +81,353 bytes |   +20,225 bytes |

The shared source chunk grew by `49,111` bytes raw and `11,271` bytes gzip,
covering both distribution charts, `GaugeChart`, and the Recharts polar modules
(`PieChart`, `Pie`, `Sector`). The remaining `31,739` bytes raw are the three
new story chunks. Only five modules are added because the polar modules reuse
the engine core already shipped for Phase 4C.

### Interaction ownership

Recharts' keyboard layer resolves the active item from a tooltip axis index,
which polar charts do not provide reliably. Luna therefore disables the
Recharts accessibility layer for distribution charts and owns the interaction:

- One focusable surface per chart, named by the chart title and described by a
  localizable keyboard hint.
- Arrow keys move between segments in legend order and wrap; `Home`, `End`, and
  `Escape` are supported.
- Keyboard readings are announced through a polite live region; pointer and
  keyboard both open the same portaled `ChartTooltip`, anchored to the segment.
- Hovering a legend row highlights its segment and vice versa, so identity is
  linked by label and position, not by color alone.
- A visually hidden data table carries every category, value, and
  consumer-supplied percentage. Luna never derives percentages.

### Half donut and gauge

`DonutChart` accepts `arc="half"`, which renders the same Recharts sectors from
nine o'clock to three o'clock over the top and crops the square plot to its top
half, so keyboard, tooltip, legend, and slice-label behavior is unchanged.

`GaugeChart` shows one value against a `min`/`max` scale, a different job from
part-to-whole distribution. It draws a static SVG arc (continuous or
`segmented` blocks) without Recharts, since there is nothing to lay out or
interact with. It is exposed as `role="meter"` with `aria-valuenow`,
`aria-valuemin`, `aria-valuemax`, and a localizable `aria-valuetext`. Values
beyond the scale are clamped for the meter but shown as given, and a partly
reached segment is tinted in proportion rather than rounded up.

### Categorical palette update

Every segment of a pie is adjacent to its neighbours, including last to first,
so Phase 4D re-validated the categorical palette. The previous order failed:
`--chart-4` (`#b45309`) against `--chart-5` (`#be123c`) measured ΔE 11.5 for
normal vision and 5.7 for deuteranopia, and `--chart-2` (`#0f766e`) sat below
the chroma floor.

`--chart-1` stays on the primary blue. The other slots move to fresher steps:

| Token       | Before    | After     | Label foreground |
| ----------- | --------- | --------- | ---------------- |
| `--chart-1` | `#0065f4` | `#0065f4` | `#ffffff`        |
| `--chart-2` | `#0f766e` | `#0d9488` | `--foreground`   |
| `--chart-3` | `#7c3aed` | `#7f56f2` | `#ffffff`        |
| `--chart-4` | `#b45309` | `#ea580c` | `--foreground`   |
| `--chart-5` | `#be123c` | `#ec4899` | `--foreground`   |

The palette passes every validator check with wraparound adjacency: worst
adjacent pair ΔE 16.2 for normal vision and 14.1 for deuteranopia, chroma at
least 0.1, and every mark at least 3:1 against the surface. The lighter fills no
longer carry white text at 4.5:1, so each slot pairs with a
`--chart-N-foreground` token for text drawn on it; consumers who override a
chart color override its foreground with it.

#### Consumer impact

- `LineChart`, `BarChart`, and `AreaChart` read the same `--chart-2` to
  `--chart-5` tokens, so Phase 4C series 2 to 5 change color too. Their dash
  and fill patterns are unchanged, so series stay identifiable without color.
- The primitive tokens `--luna-teal-700`, `--luna-purple-600`,
  `--luna-orange-700`, and `--luna-rose-700` are removed, replaced by
  `--luna-teal-600`, `--luna-violet-500`, `--luna-orange-600`, and
  `--luna-pink-500`. Nothing in Luna referenced the old names, and the package
  is not yet published, so no alias is kept. The release notes must list the
  rename for anyone who referenced the primitives directly.

## Sources

- [Recharts responsive sizing](https://recharts.github.io/en-US/guide/sizes/)
- [Recharts API and accessibility layer](https://recharts.github.io/en-US/api/)
- [Recharts package metadata](https://github.com/recharts/recharts/blob/main/package.json)
- [visx](https://visx.airbnb.tech/)
- [Chart.js accessibility](https://www.chartjs.org/docs/latest/general/accessibility.html)
- [Apache ECharts ARIA guidance](https://echarts.apache.org/handbook/en/best-practices/aria/)
