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

## Sources

- [Recharts responsive sizing](https://recharts.github.io/en-US/guide/sizes/)
- [Recharts API and accessibility layer](https://recharts.github.io/en-US/api/)
- [Recharts package metadata](https://github.com/recharts/recharts/blob/main/package.json)
- [visx](https://visx.airbnb.tech/)
- [Chart.js accessibility](https://www.chartjs.org/docs/latest/general/accessibility.html)
- [Apache ECharts ARIA guidance](https://echarts.apache.org/handbook/en/best-practices/aria/)
